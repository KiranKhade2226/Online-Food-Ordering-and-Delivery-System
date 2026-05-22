const mongoose = require('mongoose');
const dns = require('dns');
// set public DNS servers to improve SRV resolution in environments with restricted DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if not permitted
}

const redactUri = (uri) => {
  try {
    return uri.replace(/:(?:[^:@/]+)@/, ':****@');
  } catch (e) {
    return uri;
  }
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  // If the URI contains the literal placeholder <db_password> and a MONGO_PASSWORD env is provided,
  // replace it so users don't need to embed the password directly into the URI string.
  let uri = process.env.MONGO_URI;
  if (uri.includes('<db_password>') && process.env.MONGO_PASSWORD) {
    const encoded = encodeURIComponent(process.env.MONGO_PASSWORD);
    uri = uri.replace(/<db_password>/g, encoded);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error for', redactUri(uri));
    throw err;
  }
};

module.exports = connectDB;
