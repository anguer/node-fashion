/**
 * node-fashion server.js
 *
 * @author: YangYue
 * @description: source file
 * @param:
 *  - port
 *  - baseUrl
 */
var express = require('express')
var http = require('http')
var util = require('util')
var fill = require('lodash/fill')

var DEFAULTS_PORT = 12321
var DEFAULTS_BASE_URL = '/api'

var app = express()

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val) {
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
}

/**
 * 格式化输出字符串
 * @param target
 * @param length
 * @param place
 * @returns {string}
 */
function printStr (target, length, place) {
  target = target || ''
  length = length || 0
  place = place || ' '

  target = target.toString()
  length = length > target.length ? length - target.length : target.length
  var str = fill(new Array(length), place)
  return target + str.join('')
}

/**
 * 应用服务器 - 构造函数
 * @param opt
 * @constructor
 */
var Server = function (opt) {
  var self = this
  opt = opt || {}

  this.app = app
  this.port = normalizePort(opt.port) || DEFAULTS_PORT
  this.baseUrl = opt.baseUrl || DEFAULTS_BASE_URL
  this.debugger = opt.debugger || false

  this.logger = opt.logger || console.log

  /**
   * 配置通用响应中间件函数
   */
  this.app.use(function (req, res, next) {
    /**
     * 定义通用响应处理函数
     * @param err
     * @param result
     */
    res.endcb = res.respond = function (err, result) {
      if (err) {
        self.logger(err)
        res.status(500).json({
          message: err.message
        })
      } else {
        var message = null
        if (result && result.dataValues) {
          message = result.dataValues
        } else {
          message = result
        }

        self.logger('╔════════════════════════════════════════════════╗')
        self.logger('║              ↓↓↓Response data↓↓↓               ╚')
        if (typeof message === 'object') {
          Object.keys(message).forEach(function (key) {
            if (typeof message[key] === 'object') {
              self.logger('║ %s =   %s', printStr(key, 10), JSON.stringify(message[key]))
            } else {
              self.logger('║ %s =   %s', printStr(key, 10), message[key])
            }
          })
        } else {
          self.logger('║ %s =   %s', printStr('字符串消息', 10), message)
        }
        self.logger('║              ↑↑↑Response data↑↑↑               ╔')
        self.logger('╚════════════════════════════════════════════════╝')
        res.json(message)
      }
    }
    /**
     * 定义异常处理函数
     * @param err
     * @param code
     */
    res.err = res.error = function (err, code) {
      var statusCode = code || 500
      if (typeof err === 'object') {
        self.logger(err.message)
        res.status(statusCode).json({
          message: err.message
        })
      } else {
        self.logger(err)
        res.status(statusCode).json({
          message: err
        })
      }
    }
    next()
  })
}

/**
 * 保留use函数
 * @param fn
 */
Server.prototype.use = function (fn) {
  var self = this

  if (typeof fn === 'function') {
    self.app.use(fn)
  } else {
    self.app.use.apply(self.app, Array.prototype.slice.call(arguments))
  }
}

/**
 * 定义接口路由
 * @param handles
 */
Server.prototype.handle = function (handles) {
  var self = this
  var router = express.Router()

  function configRouter (api) {
    if (api && api.method && api.url && api.handle) {
      var method = api.method.toLowerCase()
      if (self.debugger) {
        self.logger(
          '%s::http://127.0.0.1:%s => [%s]',
          printStr(api.method.toUpperCase(), 6),
          self.port + self.baseUrl + api.url,
          api.description || ''
        )
      }
      router[method] && router[method](api.url, api.handle)
    } else if (Object.keys(api).length > 0) {
      Object.keys(api).forEach(function (t) {
        configRouter(api[t])
      })
    }
  }

  // 接口定义是一个Object的情况下
  if (handles instanceof Object && typeof handles !== 'function') {
    Object.keys(handles).forEach(function (t) {
      var handle = handles[t]

      if (handle instanceof Array) {
        for (var i = 0; i < handle.length; i++) {
          configRouter(handle[i])
        }
      } else if (handle instanceof Object && typeof handle !== 'function') {
        configRouter(handle)
      } else {
        var message = util.format('接口列表中,键[%s]的值应该是一个Object或Array.', t)
        throw new Error(message)
      }
    })
  } else {
    self.logger('接口定义应该是一个Object或Array.')
  }

  self.app.use(self.baseUrl, router)
}

/**
 * 启动服务器
 */
Server.prototype.start = function () {
  var self = this
  var port = self.port

  // catch 404 and forward to error handler
  self.app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // error handler
  self.app.use(function (err, req, res) {
    res.status(err.status || 500)
    res.json(err)
  })

  self.app.set('port', port)

  // 创建服务
  var server = http.createServer(self.app)

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port, function () {
    var p = server.address().port
    self.logger('Express server listening on port [%s], [%s]', p, 'http://127.0.0.1:' + p)
  })

  server.on('error', onError)
  server.on('listening', onListening)

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError (error) {
    if (error.syscall !== 'listen') {
      throw error
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port

    // handle specific listen errors with friendly messages
    if (error.code === 'EACCES') {
      self.logger(bind + ' requires elevated privileges')
      process.exit(1)
    } else if (error.code === 'EADDRINUSE') {
      self.logger(bind + ' is already in use')
      process.exit(1)
    } else {
      throw error
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening () {
    var addr = server.address()
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
    console.debug('Listening on ' + bind)
  }
}

module.exports = Server
