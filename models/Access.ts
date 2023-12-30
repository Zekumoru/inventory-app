import { Schema, model } from 'mongoose'

export interface IAccess {
  password: string;
  perms: {
    all?: boolean;
    insert?: boolean;
    update?: boolean;
    upload?: boolean;
    delete?: boolean;
  };
}

const AccessSchema = new Schema({
  password: {
    type: String,
    minLength: 3,
    maxLength: 30,
    trim: true,
    required: true,
    unique: true,
  },
  perms: {
    all: Boolean,
    insert: Boolean,
    update: Boolean,
    upload: Boolean,
    delete: Boolean,
  },
})

export default model('Access', AccessSchema);
