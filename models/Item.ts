import { Schema, model } from "mongoose";

const ItemSchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxLength: 300,
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
