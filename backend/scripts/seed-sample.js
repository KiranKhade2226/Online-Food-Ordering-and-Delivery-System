require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
const FoodItem = require('../src/models/FoodItem');
const User = require('../src/models/User');

const seedSampleData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const owner = (await User.findOne({ role: 'restaurantOwner' })) || (await User.findOne({ role: 'owner' }));
  if (!owner) {
    throw new Error('Restaurant owner not found. Run npm run seed:demo first.');
  }

  const restaurant = await Restaurant.findOneAndUpdate(
    { name: 'Pizza Palace' },
    {
      $set: {
        ownerId: owner._id,
        name: 'Pizza Palace',
        address: '123 Main Street, Downtown',
        gpsLocation: {
          type: 'Point',
          coordinates: [77.228939, 28.5043955],
        },
        isApproved: true,
        prepTimeMinutes: 25,
      },
    },
    { new: true, upsert: true }
  );

  const foodItem = await FoodItem.findOneAndUpdate(
    { restaurantId: restaurant._id, name: 'Margherita Pizza' },
    {
      $set: {
        restaurantId: restaurant._id,
        name: 'Margherita Pizza',
        price: 299,
        category: 'Pizza',
        description: 'Classic tomato, mozzarella, and basil pizza.',
        isAvailable: true,
      },
    },
    { new: true, upsert: true }
  );

  await Restaurant.updateOne({ _id: restaurant._id }, { $addToSet: { menu: foodItem._id } });

  console.log('Sample restaurant and menu item seeded: Pizza Palace / Margherita Pizza');
  await mongoose.disconnect();
};

seedSampleData().catch((error) => {
  console.error('Failed to seed sample data:', error);
  process.exit(1);
});
