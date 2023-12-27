import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Item, { IItem } from "../models/Item";
import { IdRequest, RenderResponse } from "../types/controller";
import { Types, isValidObjectId } from "mongoose";
import { ValidationError, body, validationResult } from "express-validator";
import Category, { ICategory } from "../models/Category";
import constants from "../models/constants";

// Types for item list
interface ItemListLocals {
  title: string;
  items: IItem[];
}

// Display all items
export const item_list = asyncHandler(async (req: Request, res: RenderResponse<ItemListLocals>, next: NextFunction) => {
  const items = await Item.find<IItem>().populate('category').sort({ name: 1 }).exec();

  res.render('item_list', {
    title: 'Items',
    items,
  });
});

// Types for item detail page
interface ItemDetailLocals {
  title: string;
  item: IItem | null;
}

// Display detail page for an item
export const item_detail = [
  asyncHandler(async (req: IdRequest, res: RenderResponse<ItemDetailLocals>, next: NextFunction) => {
    if (!isValidObjectId(req.params.id)) {
      // Invalid item id
      res.status(400);
      return res.render('item_detail', {
        title: 'Invalid item id',
        item: null,
      });
    }

    const item = await Item.findById<IItem>(req.params.id).populate('category').exec();

    if (item === null) {
      // Item does not exist
      res.status(404);
      return res.render('item_detail', {
        title: 'Item not found',
        item: null,
      });
    }

    // Render item
    res.render('item_detail', {
      title: `Item: ${item.name}`,
      item,
    })
  }),
];

// Types for item create/update page
interface ItemFormLocals {
  title: string;
  name?: string;
  description?: string;
  category?: string | null,
  price?: number;
  units?: number;
  errors?: Record<string, ValidationError>;
  categories: ICategory[]; // Used for selecting a category
  constants: object;
}

interface ItemFormBody {
  name: string;
  description: string;
  category: string | null;
  price: number;
  units: number;
}

// Display create form on GET
export const item_create_get = asyncHandler(async (req: Request, res: RenderResponse<ItemFormLocals>, next: NextFunction) => {
  const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();

  res.render('item_form', {
    title: 'Create new item',
    categories,
    constants,
  });
});

// Handle creating item on POST
export const item_create_post = [
  // Validate and sanitize fields
  body('name')
    .trim()
    .isLength({ min: constants["item-name-min-length"], max: constants["item-name-max-length"] })
    .withMessage(`Name must be ${constants["category-name-min-length"]} to ${constants["category-name-max-length"]} characters long`)
    .escape(),
  body('description')
    .trim()
    .isLength({ max: constants["item-description-max-length"] })
    .withMessage(`Description must be below or equal to ${constants["item-description-max-length"]}`)
    .escape(),
  body('category')
    .customSanitizer((categoryId: string) => {
      if (categoryId === "") return null;
      return categoryId;
    }),
  body('price')
    .trim()
    .isFloat({ min: 0 })
    .withMessage(`Price must be a positive number`),
  body('units')
    .trim()
    .isInt({ min: 0 })
    .withMessage(`Units must be a positive integer`),

  // Process request after validation and sanitization
  asyncHandler(async (req: Request<{}, {}, ItemFormBody>, res: RenderResponse<ItemFormLocals>, next: NextFunction) => {
    const errors = validationResult(req);
    const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();
    const isValidCategory = req.body.category === null || (isValidObjectId(req.body.category) && !!(await Category.findById<ICategory>(req.body.category).exec()));

    if (!errors.isEmpty() || !isValidCategory) {
      const otherErrors = (() => {
        const map: Record<string, ValidationError> = {};
        if (!isValidCategory) {
          map.category = {
            type: "field",
            value: req.body.category,
            msg: "Invalid category id, don't try to be smart, I know you edited the <select> element.",
            path: "category",
            location: "body",
          } as ValidationError;
        }
        return map
      })();

      // There are errors. Pass them to the form view.
      return res.render('item_form', {
        title: 'Create new item',
        name: req.body.name,
        price: req.body.price,
        units: req.body.units,
        description: req.body.description,
        category: req.body.category,
        errors: { ...errors.mapped(), ...otherErrors },
        categories,
        constants,
      });
    }

    // Create item
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      units: req.body.units,
      category: req.body.category,
    })

    await item.save();
    res.redirect((item as unknown as IItem).url);
  }),
];

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
