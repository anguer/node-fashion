/**
 * Created by yangyue on 2017/12/2.
 */
module.exports = {
  'getAll': {
    url: '/books',
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
  'getById': {
    url: '/books/:id',
    method: 'get',
    handle: function (req, res) {
      res.respond(null, 'get users by id.')
    }
  }
  ,
  'save': {
    url: '/books',
    method: 'post',
    handle: function (req, res) {
      res.respond(null, 'add a user.')
    }
  }
}
