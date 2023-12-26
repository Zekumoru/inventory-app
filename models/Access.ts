import { Schema, Types, model } from 'mongoose'
import { IItem } from './Item';
import { ICategory } from './Category';

export interface IAccess {
  item?: IItem | Types.ObjectId;
  category?: ICategory | Types.ObjectId;
  password: string;
}

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
