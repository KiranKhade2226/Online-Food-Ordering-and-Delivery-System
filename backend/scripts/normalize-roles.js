require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const mapRole = (role) => {
  if (role === 'owner') return 'restaurantOwner';
  if (role === 'delivery') return 'deliveryPartner';
  return role;
};

const normalizeRoles = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({ role: { $in: ['owner', 'delivery'] } });
  for (const user of users) {
    user.role = mapRole(user.role);
    await user.save();
  }

  console.log(`Normalized ${users.length} legacy role values.`);
  await mongoose.disconnect();
};

normalizeRoles().catch((error) => {
  console.error('Failed to normalize roles:', error);
  process.exit(1);
});