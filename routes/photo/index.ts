import { Request, Response } from "../../src"

export const GET = async (req: Request, res: Response) => {
    res.json({})
}

export const POST = (req: Request, res: Response) => {
    console.log(req.file)
    res.json({})
}

