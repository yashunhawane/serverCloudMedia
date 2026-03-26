import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupService = async ({ email, userName, password }) => {
  // check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await User.create({
    email,
    userName,
    password: hashedPassword,
  });

  return user;
};

export const loginService = async ({ userName, password }) => {
  const user = await User.findOne({ userName });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // generate token
const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
    userName: user.userName,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

  return { user, token };
};

