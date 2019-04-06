// Import the required packages.
const
  http2 = require('http2'),
  // Create the basic server
  server = http2.createServer();

// register the event for listening for incoming connection
// We dont need to use req,res like in http
// The stream is a wrapper for the request & response
server.on('stream', (stream, headers) => {

  // The `:` is called sudo headers.
  // They are special http2 headers and you cant have your own headers
  stream.respond({
    ':status': 200
  });
  stream.end('<h1>Hello from server</h1>');
});

// Setup the listening port like.
// But unlike in http1, https require TLS in order to work
server.listen(3001);

console.log('-----------------------------')
console.log('This will not work with http2')
console.log('-----------------------------')