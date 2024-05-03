import { Request, Response } from "../page-router";

export default function (req: Request, res: Response) {
    res.html(`
    <img src="./photo/unnamed%20copy.jpg"/>
    `)
}