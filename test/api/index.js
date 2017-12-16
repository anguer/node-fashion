/**
 * Created by yangyue on 2017/12/2.
 */
module.exports = [
  require('./users'),
  require('./books'),
  {
    url: '/hello',
    method: 'get',
    handle: function (req, res) {
      res.send('hello world.')
    }
  }
]
// module.exports = {
//   'users': require('./users'),
//   'books': require('./books'),
//   'hello': {
//     url: '/hello',
//     method: 'get',
//     handle: function (req, res) {
//       res.send('hello world.')
//     }
//   },
//   'test': 'test'
// }
