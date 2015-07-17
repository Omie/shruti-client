

//var defaultSettings = { "since":  Math.floor(Date.now() / 1000) };
var defaultSettings = { "since":  (Math.floor(Date.now() / 1000))-3600 };

app.controller('MainCtrl', ['$scope', 'providerFactory', 'settingFactory',
        'notificationFactory',
        function($scope, providerFactory, settingFactory, notificationFactory) {

    $scope.status;
    $scope.providers;
    $scope.settings = {};
    $scope.newSettings = {};
    $scope.notifications = {};

    getProviders();
    getSettings(clientID);

    $scope.getNotifications = function() {
        getNotifications($scope.settings.since);
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
                getNotifications($scope.settings.since);
            })
            .error(function (error) {
                $scope.status = 'Unable to load settings data, reset to default';
                $scope.settings = defaultSettings;
                getNotifications($scope.settings.since);
                createSetting(clientID, defaultSettings);
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

        //$scope.notifications = notificationFactory.getNotifications(since)
        notificationFactory.getNotifications(since)
            .success(function (noti) {
                angular.forEach(noti, function(n) {
                    n.heard = false;
                    $scope.notifications[n.id] = n;
                });

                //I HAVE NO IDEA WHO PUTS THEM IN THERE
                delete $scope.notifications["$$state"];
                delete $scope.notifications["success"];
                delete $scope.notifications["error"];

                $scope.newSettings = $scope.settings;
                $scope.newSettings.since =  now;
                updateSetting(clientID, $scope.newSettings);
            })
            .error(function (error) {
                $scope.status = 'Unable to load notification data';
            });
    }


}]);

