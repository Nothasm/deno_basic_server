import { Server } from "./server.ts";

const server = new Server();

server.get("/test", (req) => {
  req.req.respond({
    body: "Ok",
  });
});

server.get("/user/:id/", (req) => {
  req.req.respond({
    body: req.params.id,
  });
});

server.listen(3000, (port) => {
  console.log(`Server listening on port: ${port}`);
});
