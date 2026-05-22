require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const users = [
  { name: 'Admin', email: 'admin@example.com', password: 'Admin@12345', role: 'admin' },
  { name: 'Customer User', email: 'customer1@example.com', password: 'Customer@12345', role: 'customer' },
  { name: 'Restaurant Owner', email: 'owner@example.com', password: 'Owner@12345', role: 'restaurantOwner' },
  { name: 'Delivery Partner', email: 'delivery@example.com', password: 'Delivery@12345', role: 'deliveryPartner' },
];

const seedDemoUsers = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI);

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await User.updateOne(
      { email: user.email },
      {
        $set: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log('Demo users seeded: admin, customer, restaurant owner, delivery partner');
  await mongoose.disconnect();
};

seedDemoUsers().catch((error) => {
  console.error('Failed to seed demo users:', error);
  process.exit(1);
});