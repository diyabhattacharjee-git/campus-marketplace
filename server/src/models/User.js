import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

/**
 * Role design note: the brief lists Student / Seller / Buyer / Admin as
 * roles, but in this marketplace anyone can both list an item AND post a
 * buyer request — "buyer" and "seller" are actions a student takes, not a
 * fixed identity. Modeling them as separate roles would mean either
 * duplicating accounts or constantly re-authorizing the same user under a
 * different role. So role here is just `student` vs `admin`; "is this user
 * currently buying or selling" is derived from which endpoint they're
 * hitting (e.g. POST /products vs POST /buyer-requests), not from a role
 * flag on the user. Admin is the one genuinely distinct identity — it
 * unlocks the moderation endpoints in Step 15.
 */
const ROLES = ['student', 'admin'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default — must opt in with .select('+password')
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // Cloudinary public_id, for later deletion
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
    },
    department: { type: String, trim: true, default: '' },
    phone: {
      type: String,
      trim: true,
      default: '',
      match: [/^$|^[0-9+\-\s()]{7,15}$/, 'Enter a valid phone number'],
    },
    bio: { type: String, maxlength: [300, 'Bio cannot exceed 300 characters'], default: '' },

    role: { type: String, enum: ROLES, default: 'student' },

    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    // Hashed tokens only — the raw token is emailed to the user and never
    // stored. If the DB is ever leaked, a stolen hash can't be used as a
    // working verification/reset link.
    verificationTokenHash: { type: String, select: false, default: null },
    verificationTokenExpires: { type: Date, select: false, default: null },
    passwordResetTokenHash: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ college: 1 });

// Hash the password whenever it's set/changed — never on every save.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** Strip sensitive/internal fields before a user document is ever sent to the client. */
userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationTokenHash;
  delete obj.verificationTokenExpires;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
