const HTTP2_PORT = 3001;

/**
 * create an http2 server
 */
const http2 = require("http2");
const fs = require("fs");
const path = require("path");
const mime = require("mime");

// Read the required information for TLS connection
const TLSSettings = {
  key: fs.readFileSync(`${path.join(__dirname, `/secrets/server.key`)}`),
  cert: fs.readFileSync(`${path.join(__dirname, `/secrets/server.crt`)}`)
};
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
  console.log(`Pushing file: `)
  stream.pushStream({
    ":path": path
  }, (err, pushStream) => {
    if (err) {
      throw err;
    }
    sendFile(pushStream, fileName);
  });
};

// handle requests
const http2Handlers = (req, res) => {
  console.log(req.url);
  if (req.url === "/") {
    // push style.css
    pushFile(res.stream, "/style.css", "style.css");

    // push all files in images directory
    const imageFiles = fs.readdirSync(__dirname + "/images");
    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = __dirname + "/images/" + imageFiles[i];
      const path = "/images/" + imageFiles[i];
      pushFile(res.stream, path, fileName);
    }

    // lastly send index.html file
    sendFile(res.stream, "index.html");
  } else {
    // send empty response for favicon.ico
    if (req.url === "/favicon.ico") {
      res.stream.respond({
        ":status": 200
      });
      res.stream.end();
      return;
    }
    const fileName = __dirname + req.url;
    console.log(fileName);
    sendFile(res.stream, fileName);
  }
};

http2
  .createSecureServer(TLSSettings, http2Handlers)
  .listen(HTTP2_PORT, () => {
    console.log("http2 server started on port", HTTP2_PORT);
  });