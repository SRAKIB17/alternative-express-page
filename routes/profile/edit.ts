import { Request, Response } from "../../page-router"

export const GET = async (req: Request, res: Response) => {
    return await res.json({ suc: 345 })
}