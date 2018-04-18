# 基于Node快速构建WEB应用服务的框架

## 安装
```bash
npm install --save node-fashion
```

## 选项
 - baseUrl: [String] - 默认`/api`
 - port: [Number] - 端口, 默认`12321`
 - debugger: [Boolean] - 调试模式, 默认`false`
 - logger: [Object] - 日志输出, 默认`console`
 - beforeResponse: [Callback Function]
   - 服务器响应客户端前的自定义回调函数, 你可以在这里做一些额外的工作, 默认`null`
   - 必须调用'res.respond()'方法, 该回调函数才会生效
   - 该回调接受三个参数(err, route, done)
     - err: 服务器处理返回的错误信息
     - route: 所请求的路由信息, 额外包含(params, body, originalUrl)信息
     - done: 必须调用`done()`方法来结束该回调函数
 
## Response API
 - respond:
 ```
   // 调用通用响应处理函数
   res.respond([Error Object], [Error Code | Application/json])
 ```

## 使用
users.js
```js
module.exports = [
  {
    url: '/users',
    method: 'get',
    handle: function (req, res) {
      res.respond(null, [
        {
          id: 123,
          name: 'sdx'
        },
        {
          id: 234,
          name: 'dss'
        }
      ])
    }
  },
  {
    url: '/users/:id',
    method: 'get',
    handle: function (req, res) {
      res.respond(null, 'get users by id.')
    }
  },
  {
    url: '/users',
    method: 'post',
    handle: function (req, res) {
      res.respond(null, 'add a user.')
    }
  }
]
```
api.js
```js
module.exports = [
  require('./users'),
  {
    url: '/hello-world',
    method: 'get',
    handle: function (req, res) {
      res.send('hello world.')
    }
  }
]
```
index.js
```js
var Server = require('node-fashion')

var server = new Server()

// add middleware
server.use(function (req, res, next) {
  console.log('============[配置中间件]=============')
  next()
})

// add basic api
server.use('/hello', function (req, res) {
  console.log('create api by [/hello].')
  res.send('test success.')
})

// 统一接口函数处理
server.handle(require('./api'))

server.start()
```
 
## 作者
 - [Anguer](https://github.com/anguer)
