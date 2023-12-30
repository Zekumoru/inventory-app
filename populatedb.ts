#! /usr/bin/env ts-node
/**
 * Populate db script
 * 
 * Usage:
 * 
 *     ts-node populatedb.ts -p <password>
 * 
 * Options:
 * 
 *     -p | --password <password>
 *         Sets the access password for all sample data.
 * 
 * WARNING: the password must already exists!
 *     
 */
import 'dotenv/config';
import debugExtended from './utils/debug-extended';
import Category, { ICategory } from './models/Category';
import mongoose, { Types } from 'mongoose';
import Item, { IItem } from './models/Item';
import Access from './models/Access';
import InstanceAccess from './models/InstanceAccess';

const debug = debugExtended("inventory:populate-script");

const items = new Map<string, Types.ObjectId>();
const categories = new Map<string, Types.ObjectId>();

/**
 * Get password from command line argument
 */
let password = '';

const isOption = (arg: string) => {
  return password.startsWith('-') || password.startsWith('--');
}

process.argv.forEach((arg, index, array) => {
  if (arg === '-p' || arg === '--password') {
    password = array[index + 1];
    if (!password || isOption(password)) password = '';
  }
});

/**
 * Connect to mongodb
 */

const dbConnectionString = process.env.MONGODB_CONNECT_STRING;

(async () => {
  if (dbConnectionString === undefined) {
    throw new Error('mongodb connection string is not defined');
  }

  if (password === '') {
    throw new Error('password cannot be empty');
  }

  debug('Connecting to mongodb...');
  await mongoose.connect(dbConnectionString);
  debug('Successfully connected to mongodb');

  debug('Populating db with sample data...');
  await populate();
  debug('Successfully populated db with sample data');

  debug('Closing mongodb connection...');
  await mongoose.connection.close();
  debug('Successfully closed mongodb connection');
})().catch((error: { message: string }) => {
  debug.error(`Could not connect to mongodb: ${error.message}`);
});

async function populate() {
  await createCategories();
  await createItems();
}

/**
 * Create instance functions
 */

async function categoryCreate(category: ICategory) {
  const categoryDoc = new Category(category);
  const access = await Access.findOne({ password });
  if (!access) throw new Error('missing access document which contains the password provided');

  const accessInstance = new InstanceAccess({
    category: categoryDoc._id,
    access: access._id,
  });

  await Promise.all([
    categoryDoc.save(),
    accessInstance.save(),
  ]);

  categories.set(category.name, categoryDoc._id);
  debug(`Added category: ${category.name}`);
}

async function itemCreate(item: IItem) {
  const itemDoc = new Item(item);
  const access = await Access.findOne({ password });
  if (!access) throw new Error('missing access document which contains the password provided');

  const accessInstance = new InstanceAccess({
    item: itemDoc._id,
    access: access._id,
  });

  await Promise.all([
    itemDoc.save(),
    accessInstance.save(),
  ]);

  items.set(item.name, itemDoc._id);
  debug(`Added item: ${item.name}`);
}

/**
 * Create collections functions
 */

async function createCategories() {
  debug('Adding categories...');
  await Promise.all([
    categoryCreate({
      name: "Electronics",
      description: "Shop home entertainment, TVs, home audio, headphones, cameras, accessories and more",
    } as ICategory),
    categoryCreate({
      name: "Software",
      description: "Shop for PC and Mac software including business, games, photography and more",
    } as ICategory),
    categoryCreate({
      name: "Toys and Games",
      description: "Shop action figures, arts and crafts, dolls, puzzles, learning toys and more",
    } as ICategory),
  ]);
}

async function createItems() {
  debug('Adding items...');
  await Promise.all([
    itemCreate({
      name: 'Bose NEW QuietComfort Wireless Noise Cancelling Headphones, Bluetooth Over Ear Headphones with Up To 24 Hours of Battery Life, Black',
      description: 'Go beyond the beat and take control of the sound that puts you on top of the world with Bose QuietComfort Wireless Noise Cancelling Headphones. Experience powerful high-fidelity audio with legendary noise cancellation in these wireless Bluetooth headphones that allow you to block everything out but the beat and control what you hear. These Bose wireless headphones feature new custom modes that give you the power to adjust noise cancellation based in the moment and the option to turn on Wind Block to tune out breezy environments. Or simply toggle your Bose over ear headphones between Quiet and Aware Modes for a quick change when the world calls for it. These Bose wireless headphones come in Black, White Smoke, and a striking limited-edition Cypress Green headphones color option that are as bold as they are iconic. Adjustable EQ puts you in control of tuning your music and Spotify Tap starts your listening session at the push of a button on the side of the over the ear headphones. With up to 24 hours of battery life on a single charge, your Bluetooth headphones are ready for any adventure. Multi-point toggle lets you switch between multiple wireless connections on these around ear headphones without disconnecting and reconnecting each time. Plug in the optional audio cable with in-line microphone into these wireless headphones to make the headphones wired and use without a Bluetooth connection. The Bose Music app guides you through setup, lets you personalize settings, and keeps your headphones’ software up-to-date. Press play and take charge of your music with Bose QuietComfort Noise Cancelling Headphones.',
      category: categories.get('Electronics'),
      price: 249,
      units: 10,
    } as IItem),
    itemCreate({
      name: 'Nintendo Switch™ with Neon Blue and Neon Red Joy-Con™',
      description: 'Play at home or on the go with one system The Nintendo Switch™ system is designed to go wherever you do, instantly transforming from a home console you play on TV to a portable system you can play anywhere. So you get more time to play the games you love, however you like.',
      category: categories.get('Electronics'),
      price: 296.99,
      units: 3,
    } as IItem),
    itemCreate({
      name: 'hp Newest Essential 15 Laptop, 16GB RAM, 640GB(128GB SSD+512GB USB), 15.6" Anti-Glare Display, Intel Quad-Core Processor, Office 365 1-Year, Upto 11hrs Battery, Type-C, Fast Charging, Win11S, JVQ mp',
      description: `Processor: Intel Pentium N200 4 Cores (4T up to 3.7 GHz, 6 MB)

      Graphics: Integrated Intel UHD Graphics
      
      Operating system: Windows 11 Home in S Mode
      
      Memory: 16 GB DDR4-3200 MHz
      
      Hard Drive: 128GB SSD and HP P500 512GB USB`,
      category: categories.get('Electronics'),
      price: 369.99,
      units: 4,
    } as IItem),
    itemCreate({
      name: `Norton 360 Premium, 2024 Ready, Antivirus software for 10 Devices with Auto Renewal - Includes VPN, PC Cloud Backup & Dark Web Monitoring [Key card]`,
      description: `Norton 360 Premium gives you comprehensive malware protection for up to 10 PCs, Macs, Android or iOS devices, including 75GB of secure PC cloud backup and Secure VPN for your devices. Enrolling in our auto-renewing subscription and storing a payment method is required for activation and use.* We won't charge you until your renewal period. You will get an email reminder before we charge your payment method and can cancel your automatic renewal at any time in your Norton account. Also included are additional features such as Password Manager, Parental Controls, SafeCam that alerts you and blocks unauthorized access to your PC’s webcam, and Dark Web Monitoring,** where we monitor and notify you if we find your personal information on the dark web.`,
      category: categories.get('Software'),
      price: 29.99,
      units: 7,
    } as IItem),
    itemCreate({
      name: `Photoshop Elements 2024 and Premiere Elements 2024 | Box with Download Code`,
      description: `From quick tweaks and trims to total transformations, Adobe Sensei AI* and automated options make editing easy, and you can learn tricks and techniques as you go with 88 step-by-step Guided Edits. Present your best pics and videos in beautiful templates for Photo Reels, video Highlight Reels, collages, slideshows, motion graphics, Quote Graphics, and animated social posts. Effortlessly organize everything. And do more on the go using web and mobile companion apps (English-only beta).`,
      category: categories.get('Software'),
      price: 99.99,
      units: 2,
    } as IItem),
    itemCreate({
      name: `Unstable Games - Happy Little Dinosaurs Base Game - Cute card game for kids, teens, & adults - Dodge life's disasters and survive the apocalypse! - 2-4 players ages 8+ - Great for game night`,
      description: `Lately, it feels like we're all just dinosaurs trying to avoid the falling meteors. In this 2-4 player game, you'll try to dodge all of life's little disasters while tuning out your incredibly rude inner demons. You might fall into a pit of hot lava or get ghosted by your dino date. But think happy thoughts because the dino who survives it all wins the game!`,
      category: categories.get('Toys and Games'),
      price: 15.29,
      units: 2,
    } as IItem),
    itemCreate({
      name: `ARELUX 10in Bee Plush Pillow Stuffed Animal Snuggly Pillow Cute Plush Toy Snuggle Buddy Bee Plushie Kawaii Soft Hugging Pillow for Kids Boys Girls`,
      description: `Care instructions - Can be washed, remember not to bleach.

      Comfortable fabric - stretch spandex fabric, soft and smooth texture, comfortable and vivid, giving you a warm and comfortable experience.
      
      Soft and full - filled with down cotton, full, comfortable and elastic, delicate hand, evenly deformed in all parts.
      
      Cute design - cute face, cartoon eyes, round bottom, vivid shape, bring you a warm and comfortable experience.
      
      Uses - It is a plush toy, a stuffed animal plush pillow, and it is also the best playmate for children.
      
      Gifts - A good choice for kids' birthdays, Christmas, Valentine's Day, etc.
      
      Office pillows - ease work fatigue and give you a relaxing moment.
      
      
      You can see me in every place you like, suitable for bedroom, living room, family, office, etc.
      
      
      The perfect choice for home, living room, bedroom, bed, sofa, chair, dorm, car seat, home decor.`,
      category: categories.get('Toys and Games'),
      price: 22.99,
      units: 4,
    } as IItem),
  ]);
}
