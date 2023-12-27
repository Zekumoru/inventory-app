import { Locals, Request, Response } from "express";

// Type interface to add id in req.params
export interface IdRequest extends Request<{
  id: string;
}> { }

export interface RenderResponse<T extends Record<string, any>> extends Omit<Response<{}, Partial<T>>, 'render'> {
  render: (view: string, options?: T) => void;
};
