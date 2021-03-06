/**
 * Created by yangyue on 2017/12/1.
 */
var Server = require('../index')

var server = new Server({
  debugger: true
})

server.static('/public')

server.use(function (req, res, next) {
  console.log('============[配置中间件]=============')
  next()
})

server.use('/hello', function (req, res) {
  console.log('test use fn.')
  res.send('test success.')
})

server.interceptors(function (req, res, route, next) {
  console.log('route', route)
  next()
})

server.beforeResponse(function (err, route, done) {
  console.log(route)
  done()
})

server.handle(require('./api'))

server.start()
