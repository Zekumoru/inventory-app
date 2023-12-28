import { NextFunction, Request, Response } from "express";
import { ResultWithContext } from "express-validator/src/chain";

// Middleware to fix async not working for custom express-validator
const asyncValidator = (validator: { run: (req: Request) => Promise<ResultWithContext> }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validator.run(req);
    next();
  };
};

export default asyncValidator;
