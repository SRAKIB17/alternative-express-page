import { Request, Response } from "../src";

export default function (req: Request, res: Response) {
    res.html(`
    <img src="./photo/unnamed%20copy.jpg"/>
    `)
}