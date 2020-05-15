import { ServerRequest } from "./dep.ts";

type HTTP_METHOD = "GET" | "POST" | "PUT" | "DELETE";

interface Request {
  req: ServerRequest;
  params: {
    [key: string]: string;
  };
}

type serverHandler = (req: Request) => void;

interface Handler {
  method: HTTP_METHOD;
  path: string | RegExp;
  handler: serverHandler;
  params: string[];
}

interface Routes {
  GET: Handler[];
  POST: Handler[];
  PUT: Handler[];
  DELETE: Handler[];
}

export class Router {
  protected routes: Routes = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: [],
  };

  private createHandler(
    method: HTTP_METHOD,
    path: string,
    handler: serverHandler,
  ) {
    const params = [];

    for (const param of path.matchAll(/\/:([a-z]+)/gi)) {
      params.push(param[1]);
    }

    const pathRegex = params.length
      ? path.replace(/(.)\/$/, "$1").replace(
        /\/:([a-z]+)/gi,
        "/([0-9a-zA-Z]+)",
      )
      : null;

    const route = {
      method,
      path: pathRegex ? new RegExp(`^${pathRegex}$`) : path,
      handler,
      params,
    };

    this.routes[method].push(route);
  }

  protected match(req: ServerRequest) {
    const path = req.url.replace(/(.)\/$/, "$1");
    let route: Handler | undefined = undefined;
    let params: {
      [key: string]: string;
    } = {};

    for (const r of this.routes[req.method as HTTP_METHOD]) {
      if (typeof r.path !== "string") {
        const matches = path.match(r.path);
        if (matches) {
          route = r;

          for (const param of r.params) {
            let c = 1;
            params[param] = matches[c++];
          }
        }
      } else {
        route = this.routes[
          req.method as HTTP_METHOD
        ].find((v) => v.path === path);
      }
    }

    route
      ? route.handler({
        req,
        params,
      })
      : req.respond({ status: 404 });
  }

  public get(path: string, handler: serverHandler) {
    this.createHandler("GET", path, handler);
  }

  public post(path: string, handler: serverHandler) {
    this.createHandler("POST", path, handler);
  }

  public put(path: string, handler: serverHandler) {
    this.createHandler("PUT", path, handler);
  }

  public delete(path: string, handler: serverHandler) {
    this.createHandler("DELETE", path, handler);
  }
}
