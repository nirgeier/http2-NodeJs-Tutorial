// Import the required packages.
const
  SERVER_PORT = 3001,
  colors = require('colors'),
  http2 = require('http2'),
  path = require('path'),
  fs = require('fs'),
  mime = require("mime");

// Read the required information for TLS connection
const TLSSettings = {
  key: fs.readFileSync(`${path.join(__dirname, `/secrets/server.key`)}`),
  cert: fs.readFileSync(`${path.join(__dirname, `/secrets/server.crt`)}`)
};

// Create the basic secure server
server =
  // Unlike http1, http2 require TLS in order to work
  http2.createSecureServer(TLSSettings)
  // Setup the listening port like.
  .listen(SERVER_PORT, function () {
    console.log(`Server is up. You can open you browser: https://localhost:${SERVER_PORT}`.yellow);
  });

// register the event for listening for incoming connection
// We dont need to use req,res like in http
// The stream is a wrapper for the request & response
server.on('stream', (stream, headers) => {

  console.log('Stream event handler');

  // The `:` is called sudo headers.
  // They are special http2 headers and you cant have your own headers
  // stream.respond({
  //   ':status': 200
  // });

  // push all files in images directory
  const imageFiles = fs.readdirSync(__dirname + "/images");
  for (let i = 0; i < imageFiles.length; i++) {
    const fileName = __dirname + "/images/" + imageFiles[i];
    const path = "/images/" + imageFiles[i];
    pushFile(stream, path, fileName);
  }

  // lastly send index.html file
  sendFile(stream, __dirname + "/index.html");
});

// read and send file content in the stream
const sendFile = (stream, fileName) => {
  const fd = fs.openSync(fileName, "r");
  const stat = fs.fstatSync(fd);
  const headers = {
    "content-length": stat.size,
    "last-modified": stat.mtime.toUTCString(),
    "content-type": mime.getType(fileName)
  };
  stream.respondWithFD(fd, headers);
  stream.on("close", () => {
    console.log("closing file", fileName);
    fs.closeSync(fd);
  });
  stream.end();
};

const pushFile = (stream, path, fileName) => {
  stream.pushStream({
    ":path": path
  }, (err, pushStream) => {
    if (err) {
      throw err;
    }
    sendFile(pushStream, fileName);
  });
};