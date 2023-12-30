#! /usr/bin/env ts-node
/**
 * Access create script
 * 
 * Usage:
 * 
 *     ts-node insert_access.ts -p <password> -a <perms>
 * 
 * Options:
 * 
 *     -p | --password <password>
 *         Sets the access password.
 *         If not specified, it will throw an error.
 * 
 *         If desired to have spaces, use quotations. E.g. -p "I'm a password!"
 * 
 *     -a | --access | --perms <perms>
 *         Sets permissions which can be the following:
 *             all: all permissions are granted
 *             insert: grant users to create
 *             update: grant users to update
 *             upload: grant users to upload (prevent some users to abuse the upload functionality)
 *             delete: grant users to delete
 * 
 * Example usage:
 * 
 *     ts-node insert_access.ts -p hello_world!24 -a insert update delete
 *     // The command above will grant users to create/update/delete with
 *     // the password hello_world!24
 *     
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import debugExtended from './utils/debug-extended';
import Access, { IAccess } from './models/Access';

const debug = debugExtended("inventory:insert-access");

/**
 * Get command line arguments
 */

let password: string = '';
const perms: string[] = [];

const isOption = (arg: string) => {
  return password.startsWith('-') || password.startsWith('--');
}

let consumePerm = false;
process.argv.forEach((arg, index, array) => {
  if (arg === '-p' || arg === '--password') {
    password = array[index + 1];
    if (!password || isOption(password)) password = '';
  } else if (arg === '-a' || arg === '--access' || arg === '--perms') {
    consumePerm = true;
    return;
  } else if (consumePerm && !isOption(arg)) {
    perms.push(arg);
    return;
  }

  consumePerm = false;
});

/**
 * Connect to mongodb
 */

const dbConnectionString = process.env.MONGODB_CONNECT_STRING;

(async () => {
  if (dbConnectionString === undefined) {
    throw new Error('mongodb connection string is not defined');
  }

  debug('Connecting to mongodb...');
  await mongoose.connect(dbConnectionString);

  await insertAccess();

  await mongoose.connection.close();
  debug('Successfully closed mongodb connection');
})().catch((error: { message: string }) => {
  debug.error(`Could not save access to mongodb: ${error.message}`);
});

/**
 * Insert access
 */

async function insertAccess() {
  if (password === '') throw new Error('Password cannot be empty!');

  const access = new Access<IAccess>({
    password,
    perms: {
      all: perms.includes('all'),
      insert: perms.includes('insert'),
      update: perms.includes('update'),
      upload: perms.includes('upload'),
      delete: perms.includes('delete'),
    }
  });

  await access.save();
  debug("Access saved to db");
}
