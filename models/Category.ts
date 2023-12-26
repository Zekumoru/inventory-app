import { Schema, model } from 'mongoose'

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
    minLength: 1,
    maxLength: 80,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxLength: 1200,
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
