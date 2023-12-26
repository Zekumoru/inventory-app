import { Schema, model } from 'mongoose'

const CategorySchema = new Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 30,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxLength: 300,
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
  return `/categories/${this._id}`
})

export default model('Category', CategorySchema);
