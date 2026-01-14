import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{

      res.set("Content-Type", "text/html; charset=utf-8");
      res.send(`<html>
        <body>
          <h1>Welcome, Chirpy Admin</h1>
          <p>Chirpy has been visited ${config.fileserverHits} times!</p>
        </body>
      </html>`);

    } catch (ex: unknown) {
      next(ex);
    }

}

export async function handlerReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{

      config.fileserverHits = 0;
      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send("Hits Reset");

    } catch (ex: unknown) {
      next(ex);
    }
}