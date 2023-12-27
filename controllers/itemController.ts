import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Item, { IItem } from "../models/Item";
import { IdRequest, RenderResponse } from "../types/controller";
import { isValidObjectId } from "mongoose";

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

// Display create form on GET
export const item_create_get = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

// Handle creating item on POST
export const item_create_post = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  throw new Error('Not implemented yet!');
});

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
