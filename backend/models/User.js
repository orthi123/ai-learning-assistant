import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * পাসওয়ার্ড সেভ করার আগে হ্যাশ করার মিডলওয়্যার
 * সমাধান: async ব্যবহার করলে next() প্যারামিটার এবং কল করার দরকার নেই।
 */
userSchema.pre("save", async function () {
  // যদি পাসওয়ার্ড মডিফাই না হয়, তবে কাজ শেষ (return)
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // এখানে next() লাগবে না, ফাংশন শেষ হলেই Mongoose বুঝে নিবে।
  } catch (error) {
    throw error; // এরর হলে সেটি থ্রো করে দিন
  }
});

/**
 * পাসওয়ার্ড ম্যাচ করার মেথড
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Note: authController-এ ইউজার খোঁজার সময় .select("+password") ব্যবহার করতে ভুলবেন না
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
