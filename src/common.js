var fill = require('lodash/fill')

module.exports = {
  /**
   * Normalize a port into a number, string, or false.
   */
  normalizePort: function (val) {
    var port = parseInt(val, 10)

    if (isNaN(port)) {
      // named pipe
      return val
    }

    if (port >= 0) {
      // port number
      return port
    }

    return false
  },

  /**
   * 格式化输出字符串
   * @param target
   * @param length
   * @param place
   * @returns {string}
   */
  printStr: function (target, length, place) {
    target = target || ''
    length = length || 0
    place = place || ' '

    target = target.toString()
    length = length > target.length ? length - target.length : target.length
    var str = fill(new Array(length), place)
    return target + str.join('')
  }
}
