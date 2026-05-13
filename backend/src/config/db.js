import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI no está definida en el entorno"
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB conectado");
};

export default connectDB;
