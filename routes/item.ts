import express from 'express'
import * as item_controller from '../controllers/itemController';

const itemRouter = express.Router();

// GET request for creating an item
itemRouter.get('/item/create', item_controller.item_create_get);

// POST request for creating an item
itemRouter.post('/item/create', item_controller.item_create_post);

// GET request to delete an item
itemRouter.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete an item
itemRouter.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update an item
itemRouter.get('/item/:id/update', item_controller.item_update_get);

// POST request to update an item
itemRouter.post('/item/:id/update', item_controller.item_update_post);

// GET request for one item
itemRouter.get('/item/:id', item_controller.item_detail);

// GET request to list all items
itemRouter.get('/items', item_controller.item_list);

export default itemRouter;
