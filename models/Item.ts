import { Schema, Types, model } from "mongoose";
import { ICategory } from "./Category";

export interface IItem {
  name: string;
  description: string;
  category: ICategory | Types.ObjectId;
  price: number;
  units: number;
  createdAt: Date;
  updated: Date;

  // virtuals
  url: string;
}

const ItemSchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 300,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxLength: 3000,
    trim: true,
  },
  price: {
    type: Number,
  },
  units: {
    type: Number,
    default: 0,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

ItemSchema.virtual('url').get(function () {
  return `/items/${this._id}`
})

export default model('Item', ItemSchema);
