import express from 'express'
import * as category_controller from '../controllers/categoryController';

const categoryRouter = express.Router();

// GET request for creating a category
categoryRouter.get('/category/create', category_controller.category_create_get);

// POST request for creating a category
categoryRouter.post('/category/create', category_controller.category_create_post);

// GET request to delete a category
categoryRouter.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete a category
categoryRouter.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update a category
categoryRouter.get('/category/:id/update', category_controller.category_update_get);

// POST request to update a category
categoryRouter.post('/category/:id/update', category_controller.category_update_post);

// GET request for one category
categoryRouter.get('/category/:id', category_controller.category_detail);

// GET request to list all categories
categoryRouter.get('/categories', category_controller.category_list);

export default categoryRouter;
