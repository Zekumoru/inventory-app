import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/Category";
import { IdRequest, RenderResponse } from "../types/controller";
import Item, { IItem } from "../models/Item";
import { isValidObjectId } from "mongoose";
import { ValidationError, body, validationResult } from "express-validator";
import constants from "../models/constants";

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

// Types for category create/update page
interface CategoryFormLocals {
  title: string;
  name?: string;
  description?: string;
  errors?: Record<string, ValidationError>;
  constants: object;
}

interface CategoryFormBody {
  name: string;
  description: string;
}

// Display create form on GET
export const category_create_get = asyncHandler(async (req: Request, res: RenderResponse<CategoryFormLocals>, next: NextFunction) => {
  res.render('category_form', {
    title: 'Create new category',
    constants,
  });
});

// Handle creating category on POST
export const category_create_post = [
  // Validate and sanitize fields
  body('name')
    .trim()
    .isLength({ min: constants["category-name-min-length"], max: constants["category-name-max-length"] })
    .withMessage(`Name must be ${constants["category-name-min-length"]} to ${constants["category-name-max-length"]} characters long`)
    .escape(),
  body('description')
    .trim()
    .isLength({ max: constants["category-description-max-length"] })
    .withMessage(`Description must be below or equal to ${constants["category-description-max-length"]} characters long`)
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req: Request<{}, {}, CategoryFormBody>, res: RenderResponse<CategoryFormLocals>, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Pass them to the form view.
      return res.render('category_form', {
        title: 'Create new category',
        name: req.body.name,
        description: req.body.description,
        errors: errors.mapped(),
        constants,
      });
    }

    // Create category
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    await category.save();
    res.redirect((category as unknown as ICategory).url);
  }),
];

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
