import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const index = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  res.render('index', { title: 'Express ' });
});
