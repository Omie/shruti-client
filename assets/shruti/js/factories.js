
app.factory('providerFactory', ['$http', function($http) {

    var urlBase = apiHost + '/providers/';
    var providerFactory = {};

    providerFactory.getProviders = function () {
        return $http.get(urlBase);
    };

    providerFactory.getProvider = function (name) {
        return $http.get(urlBase + name);
    };

    return providerFactory;
}]);

app.factory('settingFactory', ['$http', function($http) {

    var urlBase = apiHost + '/settings/';
    var settingFactory = {};

    settingFactory.getSettings = function () {
        return $http.get(urlBase);
    };

    settingFactory.getSetting = function (key) {
        return $http.get(urlBase + key);
    };

    settingFactory.createSetting = function (key, setting) {
        s = { "key": key, "value": JSON.stringify(setting),
            "provider_name": "SYSTEM" };
        return $http.post(urlBase + key, s);
    };

    settingFactory.updateSetting = function (key, setting) {
        s = { "key": key, "value": JSON.stringify(setting),
            "provider_name": "SYSTEM" };
        return $http.put(urlBase + key, s);
    };

    return settingFactory;
}]);

app.factory('notificationFactory', ['$http', function($http) {

    var urlBase = apiHost + '/notifications/';
    var notificationFactory = {};

    notificationFactory.getNotifications = function (since) {
        return $http.get(urlBase + since);
    };

    notificationFactory.getUnheardNotifications = function () {
        return $http.get(urlBase + 'unheard/');
    };

    notificationFactory.markAsHeard = function(ids) {
        //ids should be a list
        _enc_url = encodeURIComponent(JSON.stringify(ids));
        return $http.put(urlBase + 'mark-heard/' + _enc_url, {});
    }

    return notificationFactory;
}]);

