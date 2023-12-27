import { Schema, model } from 'mongoose'
import constants from './constants';

export interface ICategory {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  // virtuals
  url: string;
}

const CategorySchema = new Schema({
  name: {
    type: String,
    minLength: constants["category-name-min-length"],
    maxLength: constants["category-name-max-length"],
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxLength: constants["category-description-max-length"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
})

CategorySchema.virtual('url').get(function () {
  return `/category/${this._id}`
})

export default model('Category', CategorySchema);
