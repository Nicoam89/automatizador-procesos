import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";
import { ApiError, sendError } from "../utils/apiError.js";

const ensureDbConnection = async (res) => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    await connectDB();
    return true;
  } catch (error) {
    sendError(
      res,
      new ApiError(
        503,
        "DB_UNAVAILABLE",
        "Servicio temporalmente no disponible. Verifica MONGO_URI y que MongoDB esté encendido.",
        error.message
      )
    );

    return false;
  }
};

export const register = async (req, res) => {
  if (!(await ensureDbConnection(res))) {
    return;
  }

  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendError(
        res,
        new ApiError(400, "USER_ALREADY_EXISTS", "El usuario ya existe")
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
};

export const login = async (req, res) => {
  if (!(await ensureDbConnection(res))) {
    return;
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendError(
        res,
        new ApiError(400, "INVALID_CREDENTIALS", "Credenciales inválidas")
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return sendError(
        res,
        new ApiError(400, "INVALID_CREDENTIALS", "Credenciales inválidas")
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
};
