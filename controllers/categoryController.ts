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

// Types for category detail/delete page
interface CategoryLocals {
  title: string;
  category: ICategory | null;
  items: IItem[];
}

// Helper functions
const checkObjectIdAndRender = (id: string, res: RenderResponse<CategoryLocals>, view: string, title: string) => {
  if (isValidObjectId(id)) return false;

  // Invalid item id
  res.status(400);
  res.render(view, {
    title,
    items: [],
    category: null,
  });

  return true;
}

// Display detail page for a category
export const category_detail = asyncHandler(async (req: IdRequest, res: RenderResponse<CategoryLocals>, next: NextFunction) => {
  if (checkObjectIdAndRender(req.params.id, res, 'category_detail', 'Invalid category id')) {
    return;
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
  submitButtonText: string,
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
    submitButtonText: 'Create category',
    constants,
  });
});

// Validation array
const categoryValidations = [
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
];

// Handle creating category on POST
export const category_create_post = [
  // Validate and sanitize fields
  ...categoryValidations,

  // Process request after validation and sanitization
  asyncHandler(async (req: Request<{}, {}, CategoryFormBody>, res: RenderResponse<CategoryFormLocals>, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Pass them to the form view.
      return res.render('category_form', {
        title: 'Create new category',
        submitButtonText: 'Create category',
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
export const category_delete_get = asyncHandler(async (req: IdRequest, res: RenderResponse<CategoryLocals>, next: NextFunction) => {
  if (checkObjectIdAndRender(req.params.id, res, 'category_delete', 'Invalid category id')) {
    return;
  }

  const category = await Category.findById<ICategory>(req.params.id).exec();

  if (category === null) {
    // No results
    res.status(404);
    return res.render('category_delete', {
      title: 'Category not found',
      category: null,
      items: [],
    });
  }

  res.render('category_delete', {
    title: 'Delete category',
    items: [],
    category,
  })
});

// Handle deleting category on POST
export const category_delete_post = asyncHandler(async (req: IdRequest, res: Response, next: NextFunction) => {
  const category = await Category.findByIdAndDelete<ICategory>(req.params.id).exec();

  if (!category) {
    // Category already deleted so redirect
    return res.redirect('/categories');
  }

  const items = await Item.find({ category: req.params.id }).exec();
  await Promise.all(items.map(async (item) => {
    item.category = null;
    item.save();
  }));

  res.redirect('/categories');
});

// Display update page on GET
export const category_update_get = asyncHandler(async (req: IdRequest, res: RenderResponse<CategoryFormLocals>, next: NextFunction) => {
  const category = await Category.findById<ICategory>(req.params.id).exec();

  if (category === null) {
    // Category does not exist so redirect
    return res.redirect('/categories');
  }

  res.render('category_form', {
    title: 'Update category',
    submitButtonText: 'Update category',
    name: category.name,
    description: category.description,
    constants,
  })
});

// Handle updating category on POST
export const category_update_post = [
  // Validate and sanitize fields
  ...categoryValidations,

  // Process request after validation and sanitization
  asyncHandler(async (req: IdRequest, res: RenderResponse<CategoryFormLocals>, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Pass them to the form view.
      return res.render('category_form', {
        title: 'Update category',
        submitButtonText: 'Update category',
        name: req.body.name,
        description: req.body.description,
        errors: errors.mapped(),
        constants,
      });
    }

    // Update category
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    await Category.findByIdAndUpdate(req.params.id, category);
    res.redirect((category as unknown as ICategory).url);
  })
];
