import express from 'express';
import * as index_controller from '../controllers/indexController'

const indexRouter = express.Router();

// Get home page
indexRouter.get('/', index_controller.index);

export default indexRouter;
