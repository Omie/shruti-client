
var host = 'http://127.0.0.1:9574';

var app = angular.module('shruti', ['ngResource']);

app.controller('MainCtrl', function($scope, $resource) {

    Provider = $resource(host + '/providers/:pname', { pname: '@pname' });
    this.providers = Provider.query();
    console.log(this.providers);

    Notification = $resource(host + '/notifications/:since', { since: '@since' });
    this.n = Notification.query({ since: '1436878000' });
    console.log(this.n);

    Setting = $resource(host + '/settings/:key', { key: '@key' });
    this.s = Setting.query();
    console.log(this.s);

});

