import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';
import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Books', slug: 'books', icon: 'book-open' },
  { name: 'Electronics', slug: 'electronics', icon: 'laptop' },
  { name: 'Furniture', slug: 'furniture', icon: 'armchair' },
  { name: 'Bikes', slug: 'bikes', icon: 'bike' },
  { name: 'Calculators', slug: 'calculators', icon: 'calculator' },
  { name: 'Hostel Essentials', slug: 'hostel-essentials', icon: 'lamp' },
  { name: 'Other', slug: 'other', icon: 'package' },
];

async function seedCategories() {
  await connectDB();

  for (const category of DEFAULT_CATEGORIES) {
    // upsert: safe to re-run without creating duplicates or wiping edits an
    // admin made through the (future) admin panel.
    await Category.updateOne({ slug: category.slug }, { $setOnInsert: category }, { upsert: true });
  }

  logger.info(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
  await disconnectDB();
  process.exit(0);
}

seedCategories().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
