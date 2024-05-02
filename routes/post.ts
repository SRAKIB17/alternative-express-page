import { Request, Response } from "../src"

export const GET = async (req: Request, res: Response) => {
    res.json({ suc: 345 })
}

export const POST = (req: Request, res: Response) => {
    console.log(req.file)
    res.json({})
}