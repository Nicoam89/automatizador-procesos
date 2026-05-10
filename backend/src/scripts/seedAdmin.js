import mongoose from "mongoose";

import bcrypt from "bcryptjs";

import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    const existingUser =
      await User.findOne({
        email:
          "admin@test.com",
      });

    if (existingUser) {

      console.log(
        "El admin ya existe"
      );

      process.exit();
    }

    const hashedPassword =
      await bcrypt.hash(
        "123456",
        10
      );

    await User.create({

      name: "Admin",

      email:
        "admin@test.com",

      password:
        hashedPassword,
    });

    console.log(
      "Admin creado correctamente"
    );

    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);
  }
};

seedAdmin();