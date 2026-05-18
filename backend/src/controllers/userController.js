import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const user = await User.create({ name, email, password, role });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      theme: user.theme,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      theme: user.theme,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { currentPassword, newPassword, theme } = req.body;

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }
    const passwordMatch = await user.matchPassword(currentPassword);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
  }

  if (theme && ["light", "dark"].includes(theme)) {
    user.theme = theme;
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    theme: updatedUser.theme,
    token: generateToken(updatedUser._id),
  });
};
