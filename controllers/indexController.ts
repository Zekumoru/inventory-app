import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/Category";
import Item from "../models/Item";
import { RenderResponse } from "../types/controller";

interface IndexLocals {
  title?: string;
  categories?: ICategory[];
  categoriesCount?: number,
  itemsCount?: number,
}

// Display home page
export const index = asyncHandler(async (req: Request, res: RenderResponse<IndexLocals>, next: NextFunction) => {
  const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();
  const itemsCount = await Item.countDocuments().exec();

  res.render('index', {
    title: 'Inventory App!',
    categoriesCount: categories.length,
    categories,
    itemsCount,
  });
});
