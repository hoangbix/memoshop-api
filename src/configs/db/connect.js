const mongoose = require('mongoose');

const connect = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected mongodb successfully!!!');
  } catch (error) {
    console.error('Connection error: ' + error);
  }
};

module.exports = {
  connect,
};
