route(method: string, path: string, callback: (req: Request, res: Response) => void): void;
route(method: string, path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
route(method: string, path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
route(method: string, path: string, ...args: any[]): void {
    const middlewares = Array.isArray(args[0]) ? args[0] : typeof args[0] == 'function' ? [args[0]] : [];
    const callback = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : undefined;
    if(callback) {
        // Create a handler function that chains the middlewares and the route callback
        const handler = (req: Request, res: Response) => {
            let index = 0;
            const next = () => {
                if (index < middlewares.length) {
                    // Call the next middleware in the chain
                    middlewares[index++](req, res, next);
                }
                else {
                    // All middlewares have been executed, call the route callback
                    callback(req, res);
                }
            };
            // Start the middleware chain
            next();
        };
        // Add the route with the combined handler to the routes array
        this.#routes.push({ path, method, callback: handler });
    }
        else {
        console.log(new Error(("Route callback function is missing.");
    }
}