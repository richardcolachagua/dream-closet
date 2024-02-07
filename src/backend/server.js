const http = require("http");

const server = http.createServer((request, response) => {
  if (request.method === "POST") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      console.log("Recieved your description", body);
      response.end("Recieved your description");
    });
  } else {
    response.end("Send a POST request with your description");
  }
});

server.listen(8000);
