import { NextFunction, Request, Response } from "express";

export async function handlerReadiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        res.set("Content-Type", "text/plain; charset=utf-8");
        res.send("OK");
    } catch (ex) {
        next(ex);
    }
    
}