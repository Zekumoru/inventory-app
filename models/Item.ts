import { Schema, Types, model } from "mongoose";
import { ICategory } from "./Category";
import constants from "./constants";

export interface IItem {
  name: string;
  imageUrl?: string | null;
  description: string;
  category: ICategory | Types.ObjectId | null;
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
    minLength: constants["item-name-min-length"],
    maxLength: constants["item-name-max-length"],
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    maxLength: constants["item-description-max-length"],
    trim: true,
  },
  price: {
    type: Number,
    min: 0,
  },
  units: {
    type: Number,
    min: 0,
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
  return `/item/${this._id}`
})

export default model('Item', ItemSchema);
