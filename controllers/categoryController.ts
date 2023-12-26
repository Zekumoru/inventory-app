import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/Category";

// Types for category list
interface CategoryListLocals extends Record<string, any> {
  title?: string;
  categories?: ICategory[];
}

interface CategoryListResponse extends Omit<Response<{}, CategoryListLocals>, 'render'> {
  render: (view: string, options?: Required<CategoryListLocals>) => void;
};

// Display all categories
export const category_list = asyncHandler(async (req: Request, res: CategoryListResponse, next: NextFunction) => {
  const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();

  res.render('category_list', {
    title: 'Categories',
    categories,
  });
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
