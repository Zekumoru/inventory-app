import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

// Display all categories
export const category_list = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display detail page for a category
export const category_detail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display create form on GET
export const category_create_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle creating category on POST
export const category_create_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display delete page on GET
export const category_delete_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle deleting category on POST
export const category_delete_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Display update page on GET
export const category_update_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle updating category on POST
export const category_update_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});
