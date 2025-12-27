// Config - app settings
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/connectexpress',
  PORT: process.env.PORT || 5001,
  MIN_LAYOVER: 60,   // 1 hour min wait
  MAX_LAYOVER: 720   // 12 hours max wait
};
