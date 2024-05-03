import { Request, Response } from "../page-router";

export default function middleware(req: Request, res: Response) {
    // console.log(req.body)
    return res.next()
}
