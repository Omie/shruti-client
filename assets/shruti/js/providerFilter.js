
app.filter('filterById', function() {
  return function(input, providerId) {
    if (!input) return input;
    if (!providerId) return input;
    if (providerId == -1) return input;
    var result = {};
    angular.forEach(input, function(value, key) {
      if ( value.provider == providerId) {
        result[key] = value;
      }
    });
    return result;
  }
});
