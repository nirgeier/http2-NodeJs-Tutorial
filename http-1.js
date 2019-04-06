/**
 * Http1 server
 */
const
  SERVER_PORT = 3000,
  http = require('http'),
  path = require('path'),
  colors = require('colors'),
  nStatic = require('node-static'),
  fileServer = new nStatic.Server(path.join(__dirname, '.'));

http.createServer(function (req, res) {
  res.setHeader("Expires", new Date().toUTCString());
  fileServer.serve(req, res);
}).listen(SERVER_PORT, function () {
  console.log(`Server is up. You can open you browser: http://localhost:${SERVER_PORT}`.yellow);
});