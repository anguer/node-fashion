/**
 * Created by yangyue on 2017/12/2.
 */
module.exports = function (app) {
  // var logger = app.Logger()
  var router = app.Router()

  router.get('/', function (req, res) {
    res.send('new version.')
  })

  return router
}
