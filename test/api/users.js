/**
 * Created by yangyue on 2017/12/2.
 */
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
        },
        {
          id: 456,
          name: 'vcbg'
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
