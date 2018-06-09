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
var common = require('./common')

var DEFAULTS_PORT = 12321
var DEFAULTS_BASE_URL = '/api'

var app = express()

function getKey (route) {
  return route.method + '|' + route.url
}

/**
 * 应用服务器 - 构造函数
 * @param opt
 *  - port: [Number]
 *  - baseUrl: [String]
 *  - debugger: [Boolean]
 *  - logger: [Object]
 * @constructor
 */
var Server = function (opt) {
  var self = this
  opt = opt || {}

  this.app = app
  this.port = common.normalizePort(opt.port) || DEFAULTS_PORT
  this.baseUrl = opt.baseUrl || DEFAULTS_BASE_URL
  this.debugger = opt.debugger || false

  this.logger = opt.logger || {
    info: console.log,
    warn: console.log,
    debug: console.log,
    error: console.error
  }

  this.beforeResponseCall = null
  this.interceptorsCall = null
  this.routeMap = {}

  this.errorFn = function (err, code, req, res) {
    var statusCode = code || 500
    if (typeof err === 'object') {
      self.logger.error(err.message)
      return res.status(statusCode).json({
        message: err.message
      })
    } else {
      self.logger.error(err)
      return res.status(statusCode).json({
        message: err
      })
    }
  }
  /**
   * 配置通用响应中间件函数
   */
  this.app.use(function (req, res, next) {
    /**
     * 定义通用响应处理函数
     * @param err
     * @param result
     */
    res.respond = function (err, result) {
      function end () {
        if (err) {
          return self.errorFn(err, result, req, res)
        } else {
          var message = null
          if (result && result.dataValues) {
            message = result.dataValues
          } else {
            message = result
          }

          self.logger.info('╔════════════════════════════════════════════════╗')
          self.logger.info('║              ↓↓↓Response data↓↓↓               ╚')
          if (message && typeof message === 'object') {
            Object.keys(message).forEach(function (key) {
              if (typeof message[key] === 'object') {
                self.logger.info('║ %s =   %s', common.printStr(key, 10), JSON.stringify(message[key]))
              } else {
                self.logger.info('║ %s =   %s', common.printStr(key, 10), message[key])
              }
            })
          } else {
            self.logger.info('║ %s =   %s', common.printStr('字符串消息', 10), message)
          }
          self.logger.info('║              ↑↑↑Response data↑↑↑               ╔')
          self.logger.info('╚════════════════════════════════════════════════╝')
          return res.json(message)
        }
      }

      if (self.beforeResponseCall && typeof self.beforeResponseCall === 'function' && req.route) {
        var key = req.route && getKey({method: req.method.toLowerCase(), url: req.route.path})
        var route = Object.assign({}, self.routeMap[key] || {})
        route.originalUrl = req.originalUrl
        route.params = Object.assign({}, req.params)
        route.body = Object.assign({}, req.body)

        self.beforeResponseCall(err, route, function () {
          return end()
        })
      } else {
        return end()
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

      // debug模式下, 显示输出所有定义的路由地址及信息
      if (self.debugger) {
        self.logger.debug(
          '%s::http://127.0.0.1:%s => [%s]',
          common.printStr(api.method.toUpperCase(), 6),
          self.port + self.baseUrl + api.url,
          api.description || ''
        )
      }

      // 缓存所有路由信息
      var key = getKey({method, url: api.url})
      self.routeMap[key] = {
        url: api.url,
        baseUrl: self.baseUrl,
        method: method,
        description: api.description
      }
      // 配置路由
      if (self.interceptorsCall && typeof self.interceptorsCall === 'function') {
        router[method] && router[method](api.url, self.interceptorsCall, api.handle)
      } else {
        router[method] && router[method](api.url, api.handle)
      }
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
    self.logger.error(new Error('接口定义应该是一个Object或Array.'))
  }

  self.app.use(self.baseUrl, router)
}

/**
 * 简易路由拦截器
 * @param fn
 */
Server.prototype.interceptors = function (fn) {
  var self = this
  self.interceptorsCall = function (req, res, next) {
    var key = req.route && getKey({method: req.method.toLowerCase(), url: req.route.path})
    var route = Object.assign({}, self.routeMap[key] || {})
    return fn(req, res, route, next)
  }
}

/**
 * 服务器响应客户端前的自定义回调函数
 * @param fn
 */
Server.prototype.beforeResponse = function (fn) {
  var self = this
  self.beforeResponseCall = fn
}

/**
 * 启动服务器
 * @param cb
 */
Server.prototype.start = function (cb) {
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
  server.listen(port, cb)

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
      self.logger.error(bind + ' requires elevated privileges')
      process.exit(1)
    } else if (error.code === 'EADDRINUSE') {
      self.logger.error(bind + ' is already in use')
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
    self.logger.debug('Listening on ' + bind)
  }
}

/**
 * 静态资源目录
 * @param path
 */
Server.prototype.static = function (path) {
  var self = this
  self.app.use(express.static(path))
}

module.exports = Server
