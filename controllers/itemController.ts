import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

// Display all items
export const item_list = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display detail page for an item
export const item_detail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display create form on GET
export const item_create_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle creating item on POST
export const item_create_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display delete page on GET
export const item_delete_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle deleting item on POST
export const item_delete_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display update page on GET
export const item_update_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle updating item on POST
export const item_update_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});
