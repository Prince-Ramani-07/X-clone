const mongoose = require("mongoose");

const mongodbConnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb connected successfully!");
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = mongodbConnect;
