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
 * passwrod save korar agee hashing---------
 * solution async use,tahole next parameter call kora laagbe na-----
 */
userSchema.pre("save", async function () {
  // jodi password modify na hoy tahole kaj sesh (return)
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
  } catch (error) {
    throw error; // এরর হলে সেটি থ্রো করে দিন
  }
});

/**
 * পাসওয়ার্ড ম্যাচ করার মেথড
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Note: authController-user khujar somoy .select("+password") use korte hobe--------
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
