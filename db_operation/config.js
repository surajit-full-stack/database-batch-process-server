import _mongose from "mongoose";
const url = process.env.MONGO_URL;
export const mongose = _mongose;
export const mongoInit = async () => {
  try {
    await _mongose.connect(url);
    console.log("connected to MongoDB");
  } catch (error) {
   throw error
  }
};
