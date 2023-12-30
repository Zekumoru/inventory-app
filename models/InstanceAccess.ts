import { Schema, Types, model } from "mongoose";
import { IItem } from "./Item";
import { IAccess } from "./Access";
import { ICategory } from "./Category";

export interface IInstanceAccess {
  item?: IItem | Types.ObjectId,
  category?: ICategory | Types.ObjectId,
  access: IAccess | Types.ObjectId,
}

const InstanceAccessSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  access: {
    type: Schema.Types.ObjectId,
    ref: 'Access',
  },
});

export default model('InstanceAccess', InstanceAccessSchema);
