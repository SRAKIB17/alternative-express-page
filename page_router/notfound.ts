import path from "path";
import { Url } from "../src";

export async function notFoundHandler(req: Request, res: Response, status: number = 404): Promise<void> {
    try {
        // let filename = status!=404? '50'
        // const notfound = require(path.resolve(this.#root, `404${this.#file_type}`))?.default;
        //         if(typeof notfound == 'function') {
        //     // this.#responseHandler(req, res, notfound);
        // }
        //             else {
        //     // this.#notfound(req, res);
        // }
    }
    catch (error) {
        // this.#notfound(req, res);
    }
}

function notfound(req: Request, res: Response): void {
    // responseHandler(req, res, (req, res) => {
    //     const { path } = new Url(req?.url || "")?.urlParse;
    //     res.text(`${req?.method}: '${path}' could not find\n`);
    // });
}