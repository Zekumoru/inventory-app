import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Item, { IItem } from "../models/Item";
import { IdRequest, RenderResponse } from "../types/controller";
import { isValidObjectId } from "mongoose";
import { ValidationError, body, validationResult } from "express-validator";
import Category, { ICategory } from "../models/Category";
import constants from "../models/constants";
import asyncValidator from "../middlewares/asyncValidator";
import multer from 'multer';
import path from "path";
import fs from 'fs/promises';
import Access, { IAccess } from "../models/Access";
import InstanceAccess from "../models/InstanceAccess";

const getExtensionString = (filename: string) => {
  return filename.substring(filename.lastIndexOf('.'));
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + getExtensionString(file.originalname));
  },
});

const fileSizeLimitKB = 200;
const totalFilesLimit = 100;
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * fileSizeLimitKB, // 200 KB
  },
  fileFilter: async (req, file, callback) => {
    const uploadDir = await fs.readdir(path.join(__dirname, '../uploads'));

    if (uploadDir.length > totalFilesLimit) {
      return callback(new Error('Reached maximum storage, you cannot upload anymore images'));
    }

    if (file.mimetype.startsWith('image')) {
      return callback(null, true);
    }

    return callback(new Error('Invalid file type, must be an image.'));
  }
});

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
  imageUrl?: string | null;
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
  password: string;
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
  upload.single('image'),
  async (err: Error, req: Request, res: Response, next: NextFunction) => {
    await body('image')
      .custom(() => {
        if (err.message.match(/File too large/)) {
          throw new Error(`File too large, limit is ${fileSizeLimitKB} KB`);
        }

        if (err.message) {
          throw err;
        }
      })
      .run(req);
    next();
  },
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
  asyncValidator(
    body('password')
      .custom(async (password) => {
        const access = await Access.findOne<IAccess>({ password }).exec();
        if (access === null) {
          throw new Error('The password you entered has no permissions to create a new item');
        }
        if (access.perms.all || access.perms.insert) {
          return;
        }
        throw new Error('The password you entered has no permissions to create a new item');
      })
  ),

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
      imageUrl: (req.file) ? `/upload/${req.file.filename}` : null,
      description: req.body.description,
      price: req.body.price,
      units: req.body.units,
      category: req.body.category,
    });

    const access = await Access.findOne({ password: req.body.password });
    if (!access) throw new Error('Missing access document');
    const accessInstance = new InstanceAccess({
      item: item._id,
      access: access._id,
    });

    await Promise.all([
      item.save(),
      accessInstance.save(),
    ]);
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

// Types for delete item view
interface ItemDeleteLocals {
  title: string;
  item: IItem;
  errors: Record<string, ValidationError>;
}

// Handle deleting item on POST
export const item_delete_post = [
  asyncValidator(
    body('password')
      .custom(async (password, { req }) => {
        const access = await Access.findOne({ password }).exec();
        if (access === null) {
          throw new Error('The password you entered has no permissions to delete an item');
        }

        const accessInstance = await InstanceAccess.findOne({
          item: req.params!.id,
          access: access._id,
        }).exec();
        if (accessInstance === null) {
          throw new Error('The password you entered has no permissions to delete an item');
        }

        if (access.perms && (access.perms?.all || access.perms?.delete)) {
          return;
        }

        throw new Error('The password you entered has no permissions to delete an item');
      })
  ),
  asyncHandler(async (req: Request, res: RenderResponse<ItemDeleteLocals>, next: NextFunction) => {
    const errors = validationResult(req);

    const item = await Item.findById(req.params.id).exec();
    if (!item) throw new Error('Missing item to delete');

    if (!errors.isEmpty()) {
      // There are errors.
      return res.render('item_delete', {
        title: 'Delete an item',
        item: item as unknown as IItem,
        errors: errors.mapped(),
      });
    }

    let imageFilePath = '';
    if (item && item.imageUrl) {
      imageFilePath = path.join(__dirname, '../uploads' + item.imageUrl.substring('/upload'.length));
    }

    await Promise.all([
      (imageFilePath) ? fs.unlink(imageFilePath) : null,
      Item.deleteOne({ _id: req.params.id }).exec(),
      InstanceAccess.deleteMany({ item: item._id }).exec(),
    ]);

    res.redirect('/items');
  })
];

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
    imageUrl: item.imageUrl,
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
  asyncValidator(
    body('password')
      .custom(async (password, { req }) => {
        const access = await Access.findOne({ password }).exec();
        if (access === null) {
          throw new Error('The password you entered has no permissions to update an item');
        }

        const accessInstance = await InstanceAccess.findOne({
          item: req.params!.id,
          access: access._id,
        }).exec();
        if (accessInstance === null) {
          throw new Error('The password you entered has no permissions to update an item');
        }

        if (access.perms && (access.perms?.all || access.perms?.update)) {
          return;
        }

        throw new Error('The password you entered has no permissions to update an item');
      })
  ),

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
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        units: req.body.units,
        description: req.body.description,
        category: req.body.category,
        errors: errors.mapped(),
        categories,
        constants,
      });
    }

    const imageUrl = (req.file) ? `/upload/${req.file.filename}` : null;

    // Delete previous image (if that is being updated)
    const prevItem = await Item.findById<IItem>(req.params.id).exec();
    if (imageUrl && prevItem?.imageUrl) {
      const filepath = path.join(__dirname, '../uploads' + prevItem.imageUrl.substring('/upload'.length));
      await fs.unlink(filepath);
    }

    // Update item
    const item = new Item({
      imageUrl: imageUrl ?? prevItem?.imageUrl,
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
