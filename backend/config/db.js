import mongoose from "mongoose";//Object Data modelling,,connect mongodb with nodejs

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);//process na hole uncaught fatal expection
  }
};

export default connectDB; //server.js jaate paay
