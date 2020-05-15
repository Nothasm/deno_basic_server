import { serve, ServerRequest } from "./dep.ts";
import { Router } from "./router.ts";

export class Server extends Router {
  constructor() {
    super();
  }

  public async listen(port: number, callback: (port?: number) => any) {
    callback(port);

    for await (const req of serve({ port })) {
      this.match(req);
    }
  }
}
