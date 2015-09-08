

var defaultSettings = { "since":  Math.floor(Date.now() / 1000), autoRefreshInterval : autoRefreshInterval };

app.controller('MainCtrl', ['$scope', 'providerFactory', 'settingFactory',
        'notificationFactory', '$sce', '$pusher',
        function($scope, providerFactory, settingFactory, notificationFactory, $sce,
                $pusher) {

    $scope.status;
    $scope.providers = {};
    $scope.providerFilter = -1;

    $scope.settings = {};
    $scope.newSettings = {};

    // local dataset
    $scope.notifications = {};

    $scope.audioElement = angular.element(document.getElementById('audio'));
    $scope.audioElementDOM0 = document.getElementById('audio'); //to be able to pause playing audio

    var playing = false;

    // expose functions to scope
    $scope.getNotifications = function() {
        getNotifications($scope.settings.since);
    }

    $scope.next = function() {
        playNext(true);
    }

    // executes after every notification is played
    $scope.audioHandler = function(args) {
        playNext(true);
    }

    $scope.setProviderFilter = function(providerId) {
        $scope.providerFilter = providerId;
        playNext(true);
    }

    /* sort of private functions */

    function initApp() {
        document.getElementById('audio').addEventListener("ended", $scope.audioHandler);
        getProviders();
        getUnheardNotifications();
        getSettings(clientId, defaultSettings);
    }

    function initPusher() {
        var client = new Pusher(pusherAPIKey);
        var pusher = $pusher(client);
        pusher.subscribe(pusherChannel);
        pusher.bind(pusherEvent,
            function(n) {
                addNotificationInLocalDataset(n);
            }
        );
    }

    // this one only fetches notifications periodically
    function autoRefreshNotifications(timeout) {
        setTimeout(function(){
            autoRefreshNotifications(timeout);
        }, timeout);
        $scope.getNotifications();
    }

    // this one only initiates the play
    function autoPlay(timeout) {
        setTimeout(function(){
            autoPlay(timeout);
        }, timeout);
        playNext(false);
    }

    function playNext(force){
        if (playing && force) {
            $scope.audioElementDOM0.pause();
            id_to_update = parseInt($scope.audioElement.attr("data-id"));
            markAsHeard([id_to_update]);
            delete $scope.notifications[id_to_update];
            playing = false;
        }
        if (playing) {
            return
        }
        for(var id in $scope.notifications) {
            // get notification data
            _noti = $scope.notifications[id];

            // if filter is enabled, only play notifications from that provider
            if ( $scope.providerFilter != -1 && _noti.provider != $scope.providerFilter) {
                continue;
            }
            // encode title, to be able to use in GET request to ivona-service
            encTitle = encodeURIComponent(_noti.title);

            try {
                voice = $scope.providers[_noti.provider].voice;
            } catch(e) {
                voice = "Nicole";
            }
            if (voice == undefined) {
                voice = "Nicole";
            }

            reqUrl = "/?text=" + encTitle + "&voice=" + voice;

            // must use $sce since ivona-service is on different domain and angular wants
            // explicit declaration of trust
            $scope.audioElement.attr("src", $sce.trustAsResourceUrl( ivonaHost + reqUrl ));
            $scope.audioElement.attr("data-id", id);

            playing = true;
            $scope.status = "playing: " + _noti.title;
            break;
        }
    }


    /* functions with callbacks that consume factories */

    function addNotificationInLocalDataset(n){
        try {
            n.icon_url = $scope.providers[n.provider].icon_url;
            n.provider_dname = $scope.providers[n.provider].display_name;
        } catch(e){
            n.icon_url = "#";
            n.provider_dname = "";
        }
        $scope.notifications[n.id] = n;
    }

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
                //start both workers
                autoRefreshNotifications($scope.settings.autoRefreshInterval);
                autoPlay($scope.settings.autoRefreshInterval + 9574);  // magic ;)
                if(pusherAPIKey != false) {
                    initPusher();
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load settings data, reset to default';
                $scope.settings = defSet;
                createSetting(clientId, defSet);
                //start both workers
                autoRefreshNotifications(defSet.autoRefreshInterval);
                autoPlay(defSet.autoRefreshInterval + 9574);

                if(pusherAPIKey != false) {
                    initPusher();
                }
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
                    addNotificationInLocalDataset(n);
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

            })
            .error(function (error) {
                $scope.status = 'Unable to load notification data';
            });
    }

    function getUnheardNotifications() {

        notificationFactory.getUnheardNotifications()
            .success(function (noti) {
                angular.forEach(noti, function(n) {
                    addNotificationInLocalDataset(n);
                });
                //unheard are fetched only at start, so I know I should
                //start playing them
                playNext(false);
            })
            .error(function (error) {
                $scope.status = 'Unable to load unheard notification data';
            });
    }

    // if this is called before $scope.audioHandler is initialized,
    // it won't work
    initApp();
}]);


