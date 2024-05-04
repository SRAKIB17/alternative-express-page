export default function Error(req: any, res: any) {
    console.log(req.error)
    return res.json({ f: 345345 })
}