/**
 * Loads the categories for the sidebar.
 * 
 * However, this is really inefficient since this will be called
 * for every requests even for categories requests making it twice.
 * 
 * But for the sake of this project, I won't bother creating a cache
 * system for this.
 * 
 */
import { NextFunction, Request, Response } from "express";
import Category, { ICategory } from "../models/Category";
import asyncHandler from "express-async-handler";

// Types for item list
interface CategoryLocals extends Record<string, any> {
  title?: string;
  categories?: ICategory[];
}

interface CategoryResponse extends Response<{}, CategoryLocals> { };

export default asyncHandler(async (req: Request, res: CategoryResponse, next: NextFunction) => {
  res.locals.categories = await Category.find<ICategory>().sort({ name: 1 }).exec();
  next();
});
