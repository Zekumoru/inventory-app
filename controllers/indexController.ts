import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/Category";
import Item from "../models/Item";

interface IndexLocals extends Record<string, any> {
  title?: string;
  categories?: ICategory[];
  categoriesCount?: number,
  itemsCount?: number,
}

interface IndexResponse extends Omit<Response<{}, IndexLocals>, 'render'> {
  render: (view: string, options?: Required<IndexLocals>) => void;
};

// Display home page
export const index = asyncHandler(async (req: Request, res: IndexResponse, next: NextFunction) => {
  const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();
  const itemsCount = await Item.countDocuments().exec();

  res.render('index', {
    title: 'Inventory App!',
    categoriesCount: categories.length,
    categories,
    itemsCount,
  });
});
