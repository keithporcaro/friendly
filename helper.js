var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}

var viewModelMap = function(signature) {
  var map = {}
  return function(key) {
    if (!map[key]) {
        map[key] = {}
        for (var prop in signature) map[key][prop] = m.prop(signature[prop]())
    }
    return map[key]
  }
}
