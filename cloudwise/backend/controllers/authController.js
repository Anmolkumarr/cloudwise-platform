import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc   Register new user
// @route  POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const awsAccountName = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}awsaccount`;
    const user = await User.create({ name, email, password, awsAccountName });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      avatar: user.avatar,
      awsAccountId: user.awsAccountId,
      awsAccountName: user.awsAccountName,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      avatar: user.avatar,
      awsAccountId: user.awsAccountId,
      awsAccountName: user.awsAccountName,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged in user
// @route  GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc   Update profile (name, company, avatar, role)
// @route  PUT /api/auth/me
export const updateProfile = async (req, res, next) => {
  try {
    const { name, company, avatar, role } = req.body;

    if (name != null && !name.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (role && !["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const update = {};
    if (name != null) update.name = name.trim();
    if (company != null) update.company = company.trim();
    if (avatar != null) update.avatar = avatar;
    if (role) update.role = role;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true }).select(
      "-password"
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};