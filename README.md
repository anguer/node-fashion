# 基于Node快速构建WEB应用服务的框架

## 安装
```bash
npm install node-fashion
```

## 使用
api.js
```js
module.exports = [
  [
    {
      url: '/users',
      method: 'get',
      handle: function (req, res) {
        res.endcb(null, [
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
        res.endcb(null, 'get user by id.')
      }
    },
    {
      url: '/users',
      method: 'post',
      handle: function (req, res) {
        res.endcb(null, 'add a user.')
      }
    }
  ],
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

server.use(function (req, res, next) {
  console.log('============[配置中间件]=============')
  next()
})

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
