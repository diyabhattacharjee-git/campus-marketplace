import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 50 },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    icon: { type: String, default: 'package' }, // lucide-react icon name, rendered client-side
  },
  { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
