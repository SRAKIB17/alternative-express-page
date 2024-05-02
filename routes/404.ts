import { Request, Response } from "../src";

export default function (req: Request, res: Response) {
    res.json({ success: false })
}