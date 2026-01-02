const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

module.exports = {
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/connectexpress',
  PORT: process.env.PORT || 5001,
  JWT_SECRET,
  MIN_LAYOVER: 60,
  MAX_LAYOVER: 720
};
