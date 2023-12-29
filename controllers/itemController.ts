import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Item, { IItem } from "../models/Item";
import { IdRequest, RenderResponse } from "../types/controller";
import { Types, isValidObjectId } from "mongoose";
import { ValidationError, body, validationResult } from "express-validator";
import Category, { ICategory } from "../models/Category";
import constants from "../models/constants";
import { ResultWithContext } from "express-validator/src/chain";
import asyncValidator from "../middlewares/asyncValidator";

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

// Types for item detail/delete page
interface ItemLocals {
  title: string;
  item: IItem | null;
}

// Helper functions
const checkObjectIdAndRender = (id: string, res: RenderResponse<ItemLocals>, view: string, title: string) => {
  if (isValidObjectId(id)) return false;

  // Invalid item id
  res.status(400);
  res.render(view, {
    title,
    item: null,
  });

  return true;
}

// Display detail page for an item
export const item_detail = [
  asyncHandler(async (req: IdRequest, res: RenderResponse<ItemLocals>, next: NextFunction) => {
    if (checkObjectIdAndRender(req.params.id, res, 'item_detail', 'Invalid item id')) {
      return;
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
      title: `${item.name}`,
      item,
    })
  }),
];

// Types for item create/update page
interface ItemFormLocals {
  title: string;
  submitButtonText: string;
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
  referred?: boolean;
}

// Display create form on GET
export const item_create_get = asyncHandler(async (req: Request<{}, {}, ItemFormBody>, res: RenderResponse<ItemFormLocals>, next: NextFunction) => {
  const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();

  res.render('item_form', {
    title: 'Create new item',
    submitButtonText: 'Create item',
    category: req.body.category,
    categories,
    constants,
  });
});

// Validation array
const itemValidations = [
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
  asyncValidator(
    body('category')
      .customSanitizer((categoryId: string) => (categoryId === "") ? null : categoryId)
      .custom(async (categoryId) => {
        // category id null means uncategorized
        if (categoryId === null) return;

        const errorMessage = "Invalid category id, don't try to be smart, I know you're editing the <option>'s value.";
        if (!isValidObjectId(categoryId)) throw new Error(errorMessage);

        const category = await Category.findById(categoryId).exec();
        if (!category) throw new Error(errorMessage);
      })
  ),
  body('price')
    .trim()
    .isFloat({ min: 0 })
    .withMessage(`Price must be a positive number`),
  body('units')
    .trim()
    .isInt({ min: 0 })
    .withMessage(`Units must be a positive integer`),
];

// Handle creating item on POST
export const item_create_post = [
  // Validate and sanitize fields
  ...itemValidations,

  // Process request after validation and sanitization
  asyncHandler(async (req: Request<{}, {}, ItemFormBody>, res: RenderResponse<ItemFormLocals>, next: NextFunction) => {
    const title = "Create new item";
    const submitButtonText = "Create item";
    const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();

    // Render with category set
    // This is used for creating a new item coming from a category page.
    if (req.body.referred) {
      return res.render('item_form', {
        category: req.body.category,
        submitButtonText,
        title,
        categories,
        constants,
      })
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Pass them to the form view.
      return res.render('item_form', {
        title,
        submitButtonText,
        name: req.body.name,
        price: req.body.price,
        units: req.body.units,
        description: req.body.description,
        category: req.body.category,
        errors: errors.mapped(),
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
export const item_delete_get = asyncHandler(async (req: IdRequest, res: RenderResponse<ItemLocals>, next: NextFunction) => {
  if (checkObjectIdAndRender(req.params.id, res, 'item_delete', 'Invalid item id')) {
    return;
  }

  const item = await Item.findById<IItem>(req.params.id).populate('category').exec();

  if (item === null) {
    // No results
    res.status(404);
    return res.render('item_delete', {
      title: 'Item not found',
      item: null,
    });
  }

  res.render('item_delete', {
    title: 'Delete an item',
    item,
  });
})

// Handle deleting item on POST
export const item_delete_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await Item.findByIdAndDelete<IItem>(req.params.id).exec();
  res.redirect('/items');
});

// Display update page on GET
export const item_update_get = asyncHandler(async (req: IdRequest, res: RenderResponse<ItemFormLocals>, next: NextFunction) => {
  const [item, categories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find<ICategory>().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    // Item does not exist so redirect
    return res.redirect('/items');
  }

  res.render('item_form', {
    title: 'Update item',
    submitButtonText: 'Update item',
    name: item.name,
    description: item.description ?? '',
    category: item.category?._id.toString() ?? null,
    price: item.price!,
    units: item.units,
    categories,
    constants,
  })
});

// Handle updating item on POST
export const item_update_post = [
  // Validate and sanitize fields
  ...itemValidations,

  // Process request after validation and sanitization
  asyncHandler(async (req: IdRequest, res: RenderResponse<ItemFormLocals>, next: NextFunction) => {
    const categories = await Category.find<ICategory>().sort({ name: 1 }).exec();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Pass them to the form view.
      return res.render('item_form', {
        title: 'Update item',
        submitButtonText: 'Update item',
        name: req.body.name,
        price: req.body.price,
        units: req.body.units,
        description: req.body.description,
        category: req.body.category,
        errors: errors.mapped(),
        categories,
        constants,
      });
    }

    // Update item
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      units: req.body.units,
      category: req.body.category,
      _id: req.params.id,
    });

    await Item.findByIdAndUpdate(req.params.id, item);
    res.redirect((item as unknown as IItem).url);
  })
];
