

var defaultSettings = { "since":  Math.floor(Date.now() / 1000) };

app.controller('MainCtrl', ['$scope', 'providerFactory', 'settingFactory',
        'notificationFactory', '$sce',
        function($scope, providerFactory, settingFactory, notificationFactory, $sce) {

    $scope.status;
    $scope.providers;
    $scope.settings = {};
    $scope.newSettings = {};
    $scope.notifications = {};
    $scope.unheardNotifications = {};
    $scope.audioElement = angular.element(document.getElementById('audio'));

    var playing = false;

    getProviders();
    getSettings(clientID);

    $scope.getNotifications = function() {
        getNotifications($scope.settings.since);
    }

    $scope.audioHandler = function() {
        playing = false;
        playNext();
    }

    $scope.next = function() {
        playNext();
    }

    document.getElementById('audio').addEventListener("ended", $scope.audioHandler);

    function initPlayer() {
        setTimeout(initPlayer, 10000);
        $scope.getNotifications();
    }

    function playNext(){
        console.debug("checking if there are unheard notifications");
        //TODO: make sure something is else is not playing now
        for (var k in $scope.unheardNotifications) {
            playing = true;
            console.debug("found unheard notifications");

            _noti = $scope.unheardNotifications[k];

            enc_title = encodeURIComponent(_noti.title);
            console.debug("encoded title: ", enc_title);
            $scope.audioElement.attr("src", $sce.trustAsResourceUrl( "http://localhost:9575/?text=" + enc_title ));

            $scope.status = "playing: " + _noti.title;

            $scope.notifications[k],unheard = false;

            delete $scope.unheardNotifications[k];
            console.debug($scope.unheardNotifications);
            break
        }
    }

    function getProviders() {
        $scope.providers = providerFactory.getProviders()
            .success(function (pro) {
                $scope.providers = pro;
            })
            .error(function (error) {
                $scope.status = 'Unable to load provider data';
            });
    }

    function getSettings(key) {
        $scope.settings = settingFactory.getSetting(key)
            .success(function (sett) {
                $scope.settings = JSON.parse(sett["value"]);
                initPlayer();
            })
            .error(function (error) {
                $scope.status = 'Unable to load settings data, reset to default';
                $scope.settings = defaultSettings;
                createSetting(clientID, defaultSettings);
                initPlayer();
            });
    }

    function createSetting(key, setting) {
        settingFactory.createSetting(key, setting)
            .success(function (sett) {
                $scope.status = 'Created settings';
            })
            .error(function (error) {
                $scope.status = 'Unable to create setting';
            });
    }

    function updateSetting(key, setting) {
        settingFactory.updateSetting(key, setting)
            .success(function (sett) {
                $scope.settings = JSON.parse(sett["value"]);
                $scope.status = "Updated settings";
            })
            .error(function (error) {
                $scope.status = 'Unable to update settings';
            });
    }

    function getNotifications(since) {
        now = Math.floor(Date.now() / 1000);

        notificationFactory.getNotifications(since)
            .success(function (noti) {
                angular.forEach(noti, function(n) {
                    n.heard = false;
                    $scope.notifications[n.id] = n;
                    $scope.unheardNotifications[n.id] = n;
                });

                //I HAVE NO IDEA WHO PUTS THEM IN THERE
                delete $scope.notifications["$$state"];
                delete $scope.notifications["success"];
                delete $scope.notifications["error"];

                delete $scope.unheardNotifications["$$state"];
                delete $scope.unheardNotifications["success"];
                delete $scope.unheardNotifications["error"];

                $scope.newSettings = $scope.settings;
                $scope.newSettings.since =  now;
                updateSetting(clientID, $scope.newSettings);

                if(!playing){
                    playNext();
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load notification data';
            });
    }


}]);

