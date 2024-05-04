import { Request, Response } from "../page-router";

export default function middleware(req: Request, res: Response) {
    // console.log(req.body)
    console.log("ROOT MIDDLEWARE")
    return res.next()
}
