import { Schema, model } from 'mongoose'

const AccessSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
  },
  password: {
    type: String,
    minLength: 3,
    maxLength: 30,
    required: true,
    trim: true,
  }
})

export default model('Access', AccessSchema);
