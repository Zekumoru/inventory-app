import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/Category";
import { IdRequest, RenderResponse } from "../types/controller";
import Item, { IItem } from "../models/Item";
import { isValidObjectId } from "mongoose";

// Types for category list
interface CategoryListLocals {
  title?: string;
  categories?: ICategory[];
}

// Display all categories
export const category_list = asyncHandler(async (req: Request, res: RenderResponse<CategoryListLocals>, next: NextFunction) => {
  const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();

  res.render('category_list', {
    title: 'Categories',
    categories,
  });
});

// Types for category detail page
interface CategoryDetailLocals {
  title: string;
  category: ICategory | null;
  items: IItem[];
}

// Display detail page for a category
export const category_detail = asyncHandler(async (req: IdRequest, res: RenderResponse<CategoryDetailLocals>, next: NextFunction) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    return res.render('category_detail', {
      title: 'Invalid category id',
      category: null,
      items: [],
    });
  }

  // Get details of category
  const category = await Category.findById<ICategory>(req.params.id).exec();

  if (category === null) {
    // The category does not exist
    res.status(404);
    return res.render('category_detail', {
      title: 'Category not found',
      category: null,
      items: [],
    });
  }

  const items = await Item.find<IItem>({ category: req.params.id }).sort({ name: 1 }).exec();

  res.render('category_detail', {
    title: category.name,
    category,
    items,
  });
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
