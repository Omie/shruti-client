
// randomcolor directive picks a random color out of these
var colors = [ "#303641", "#f56954", "#00c0ef", "#0073b7", "#3c726c", "#5a3264",
                "#ec3b83", "#00a65a", "#6c541e", "#6f3a3a"];

app.directive('randomcolor', function () {
    return {
        link: function($scope, element, attrs) {
            c = colors[Math.floor(Math.random()*colors.length)] ;
            element.css('background-color', c);
            element.css('border-color', c);
        }
    };
});

app.directive('markasactive', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                element.parent().children().removeClass('active');
                element.addClass('active');
            })
        },
    }
});

