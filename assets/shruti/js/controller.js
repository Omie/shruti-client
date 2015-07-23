

var defaultSettings = { "since":  Math.floor(Date.now() / 1000), autoRefreshInterval : autoRefreshInterval };

app.controller('MainCtrl', ['$scope', 'providerFactory', 'settingFactory',
        'notificationFactory', '$sce',
        function($scope, providerFactory, settingFactory, notificationFactory, $sce) {

    $scope.status;
    $scope.providers = {};

    $scope.settings = {};
    $scope.newSettings = {};

    // local dataset
    $scope.notifications = {};
    $scope.unheardNotifications = []; //this should be a list, can maintain order then

    $scope.audioElement = angular.element(document.getElementById('audio'));
    $scope.audioElementDOM0 = document.getElementById('audio'); //to be able to pause playing audio

    var playing = false;

    // expose functions to scope
    $scope.getNotifications = function() {
        getNotifications($scope.settings.since);
    }

    $scope.next = function() {
        if (playing) {
            $scope.audioElementDOM0.pause();
            _id_to_update = parseInt($scope.audioElement.attr("data-id"));
            markAsHeard([_id_to_update]);
        }
        playNext();
    }

    // executes after every notification is played
    // marks current one as heard
    // initiate playing next
    $scope.audioHandler = function(args) {
        playing = false;
        id_to_update = parseInt($scope.audioElement.attr("data-id"));
        playNext();
        markAsHeard([id_to_update]);
    }


    /* sort of private functions */

    function initApp() {
        document.getElementById('audio').addEventListener("ended", $scope.audioHandler);
        getProviders();
        getSettings(clientId, defaultSettings);
    }

    function autoRefreshNotifications(timeout) {
        setTimeout(autoRefreshNotifications, timeout);
        $scope.getNotifications();
    }

    function playNext(){
        if( $scope.unheardNotifications.length == 0) {
            return;
        }

        // get ID
        var id = $scope.unheardNotifications[0];
        // get notification data
        _noti = $scope.notifications[id];
        // encode title, to be able to use in GET request to ivona-service
        encTitle = encodeURIComponent(_noti.title);
        voice = "Nicole";  //_noti.voice

        reqUrl = "/?text=" + encTitle + "&voice=" + voice;

        // must use $sce since ivona-service is on different domain and angular wants
        // explicit declaration of trust
        $scope.audioElement.attr("src", $sce.trustAsResourceUrl( ivonaHost + reqUrl ));
        $scope.audioElement.attr("data-id", id);

        playing = true;
        $scope.status = "playing: " + _noti.title;
        $scope.unheardNotifications.splice(0, 1); //remove element from unheardNotifications
    }


    /* functions with callbacks that consume factories */

    function getProviders() {
        providerFactory.getProviders()
            .success(function (pro) {
                angular.forEach(pro, function(p) {
                    $scope.providers[p.id] = p;
                });
            })
            .error(function (error) {
                $scope.status = 'Unable to load provider data';
            });
    }

    function getSettings(key, defSet) {
        settingFactory.getSetting(key)
            .success(function (sett) {
                $scope.settings = JSON.parse(sett["value"]);
                autoRefreshNotifications($scope.settings.autoRefreshInterval);
            })
            .error(function (error) {
                $scope.status = 'Unable to load settings data, reset to default';
                $scope.settings = defSet;
                createSetting(clientId, defSet);
                autoRefreshNotifications(defSet.autoRefreshInterval);
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

    function markAsHeard(ids) {
        notificationFactory.markAsHeard(ids)
            .success(function (heardIds) {
                $scope.status = "Marked it heard";

                for(var idx=0; idx<heardIds.length; idx++) {
                    delete $scope.notifications[heardIds[idx]];
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to mark it heard';
            });
    }


    function getNotifications(since) {
        now = Math.floor(Date.now() / 1000);

        notificationFactory.getNotifications(since)
            .success(function (noti) {
                angular.forEach(noti, function(n) {
                    try {
                        n.icon_url = $scope.providers[parseInt(n.provider)].icon_url;
                    } catch(e){
                        n.icon_url = "#";
                    }
                    $scope.notifications[n.id] = n;
                    $scope.unheardNotifications.push(n.id);
                });

                /*
                 * make a copy of current settings
                 * update timestamp
                 * if updating timestamp succeeds,
                 *  set current settings to new settings
                */
                $scope.newSettings = $scope.settings;
                $scope.newSettings.since =  now;
                updateSetting(clientId, $scope.newSettings);

                if(!playing){
                    playNext();
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load notification data';
            });
    }

    // if this is called before $scope.audioHandler is initialized,
    // it won't work
    initApp();
}]);


