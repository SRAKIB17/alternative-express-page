import { Request, Response, Router, ServerOptionsProps } from ".";
import { CreateServer } from "./createServer";

export class Server extends CreateServer {
    #option: ServerOptionsProps
    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        super(option);
        this.#option = option;
    }

    static(route: string, path: string): void;
    static(path: string): void;
    static(...args: any[]): void {
        this.static_serve(...args);
    }

    config(middlewares: ((req: Request, res: Response, next: () => void) => void)[]): void;
    config(middleware: (req: Request, res: Response, next: () => void) => void): void
    config(...args: any[]): void {
        const middlewares = Array.isArray(args[0]) ? args[0] : typeof args[0] === 'function' ? [args[0]] : [];
        this._config = this._config.concat(middlewares);
    }

    get(path: string, callback: (req: Request, res: Response) => void): void;
    get(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    get(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    get(path: string, ...args: any[]): void {
        return this.route_middleware_handler("GET", path, ...args);
    }
    //? FOR POST METHOD
    post(path: string, callback: (req: Request, res: Response) => void): void;
    post(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    post(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    post(path: string, ...args: any[]): void {
        this.route_middleware_handler("POST", path, ...args);
    }

    //? FOR PUT METHOD
    put(path: string, callback: (req: Request, res: Response) => void): void;
    put(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    put(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    put(path: string, ...args: any[]): void {
        this.route_middleware_handler("PUT", path, ...args);
    }

    //? FOR PATCH METHOD
    patch(path: string, callback: (req: Request, res: Response) => void): void;
    patch(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    patch(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    patch(path: string, ...args: any[]): void {
        this.route_middleware_handler("PATCH", path, ...args);
    }

    //? FOR DELETE METHOD
    delete(path: string, callback: (req: Request, res: Response) => void): void;
    delete(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    delete(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    delete(path: string, ...args: any[]): void {
        this.route_middleware_handler("DELETE", path, ...args);
    }

    //? FOR ALL METHOD
    all(path: string, callback: (req: Request, res: Response) => void): void;
    all(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    all(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    all(path: string, ...args: any[]): void {
        this.route_middleware_handler("ALL", path, ...args);
    }
    // ?FOR ROUTE MAKER
    router(path: string, router: Router): void;
    router(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], router: Router): void;
    router(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, router: Router): void;
    router(path: string, ...args: any[]): void {
        const middlewares = Array.isArray(args[0]) ? args[0] : typeof args[0] == 'function' ? [args[0]] : [];
        const callback: Router = typeof args[args.length - 1] === 'object' ? args[args.length - 1] : undefined;
        if (callback) {
            callback?._routes?.forEach(r => {
                const pathname = path?.length == 1 ? "" : (path?.lastIndexOf('/') > 0 && path?.lastIndexOf('/') == path?.length - 1) ? path?.slice(0, -1) : path;
                const endpoint = r?.path?.indexOf('/') == 0 ? r?.path : `/${r?.path}`;
                this.route_middleware_handler(r?.method, `${pathname}${endpoint}`, middlewares, r?.callback)
            })
        }
        else {
            console.log(new Error("Route handler missing."));
        }
    }


    // use(middleware: (req: Request, res: Response, next: (err?: any) => any) => void): void;
    use(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: ((req: Request, res: Response) => void) | Router): void;
    use(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: ((req: Request, res: Response) => void) | Router): void;
    use(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[]): void;
    use(path: string, middlewares: (req: Request, res: Response, next: () => void) => void): void;
    use(path: string, callback: ((req: Request, res: Response) => void) | Router): void;
    use(middleware: (req: Request, res: Response, next: (err?: any) => any) => void, callback: ((req: Request, res: Response) => void) | Router): void;
    use(middlewares: ((req: Request, res: Response, next: () => void) => void)[]): void;
    use(middleware: (req: Request, res: Response, next: (err?: any) => any) => void): void;
    use(...args: any[]): void {

        const path = typeof args[0] == 'string' ? args[0] : undefined;
        const middlewares = Array.isArray(args[0]) ? args[0] : typeof args[0] == 'function' ? [args[0]] : Array.isArray(args[1]) ? args[1] : typeof args[1] == 'function' ? [args[1]] : [];
        const callbackRouter: Router = typeof args[args.length - 1] === 'object' ? args[args.length - 1] : undefined;
        const callback = (typeof args[args.length - 1] === 'function' && args[args.length - 1]?.length == 2) ? args[args.length - 1] : undefined;

        //! path && router
        if (callbackRouter && path) {
            this.router(path, middlewares, callbackRouter);
        }
        //! path && callback
        else if (path && callback) {
            this.route_middleware_handler("ALL", path, middlewares, callback);
        }
        //!path and middleware
        else if (path && middlewares?.length && !callback) {
            this._config = this._config.concat(middlewares);
            const filter = this._routes.filter(r => r.path == path);
            filter?.forEach(r => {
                const handler = (req: Request, res: Response) => {
                    let index = 0;
                    const next = () => {
                        if (index < middlewares.length) {
                            // Call the next middleware in the chain
                            middlewares[index++](req, res, next);
                        }
                        else {
                            // All middlewares have been executed, call the route callback
                            r?.callback(req, res);
                        }
                    };
                    // Start the middleware chain
                    next();
                };
                this.route_middleware_handler(r?.method, r?.path, middlewares, handler)
            })
        }
        //! middleware && callback
        else if (args.length == 2 && middlewares?.length && callback) {
            this.route_middleware_handler("ALL", "*", middlewares, callback);
            this._config = this._config.concat(middlewares);

        }
        //! only callback
        else if (args?.length == 1 && callback) {
            this.route_middleware_handler("ALL", "*", middlewares, callback);
        }
        //! only middleware
        else {
            if (middlewares.length) {
                this._config = this._config.concat(middlewares);
            }
            else {
                console.log(new Error("Next middleware function or the final request handler is missing."));
            }
        }
    }

    listen(port: number, callback?: () => void) {
        this.server.listen(port, () => {
            console.log(`Server running at ${this.#option.enableSsl ? "https" : "http"}://localhost:${port}/`);
            if (typeof callback == 'function') {
                callback();
            }
        });
    }
}

