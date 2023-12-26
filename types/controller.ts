import { Request } from "express";

// Type interface to add id in req.params
export interface IdRequest extends Request<{
  id: string;
}> { }
