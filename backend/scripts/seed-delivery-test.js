require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Override DNS for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Restaurant = require('../src/models/Restaurant');
const Order = require('../src/models/Order');
const User = require('../src/models/User');

async function seedDeliveryTest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Create geospatial index on restaurants
    await Restaurant.collection.createIndex({ 'gpsLocation': '2dsphere' });
    console.log('✅ Created 2dsphere index on restaurants.gpsLocation');

    // Create test users with hashed passwords
    const hashedPassword = await bcrypt.hash('test123', 10);

    const customer = await User.findOneAndUpdate(
      { email: 'customer1@gmail.com' },
      {
        email: 'customer1@gmail.com',
        name: 'Test Customer',
        password: hashedPassword,
        role: 'customer',
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created customer user');

    const owner = await User.findOneAndUpdate(
      { email: 'owner1@gmail.com' },
      {
        email: 'owner1@gmail.com',
        name: 'Test Owner',
        password: hashedPassword,
        role: 'restaurantOwner',
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created owner user');

    const deliveryPartner = await User.findOneAndUpdate(
      { email: 'delivery1@gmail.com' },
      {
        email: 'delivery1@gmail.com',
        name: 'Test Delivery Partner',
        password: hashedPassword,
        role: 'deliveryPartner',
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created delivery partner user');

    // Create test restaurant with GPS near delivery partner
    // Delhi location: 28.6139° N, 77.2090° E
    const restaurant = await Restaurant.findOneAndUpdate(
      { name: 'Test Restaurant', ownerId: owner._id },
      {
        name: 'Test Restaurant',
        address: 'GPS location (28.6139, 77.2090)',
        gpsLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139], // [longitude, latitude]
        },
        ownerId: owner._id,
        isApproved: true,
        prepTimeMinutes: 30,
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created test restaurant with GPS');

    // Create test order with "Preparing" status (available for delivery)
    const order = await Order.create({
      customerId: customer._id,
      restaurantId: restaurant._id,
      items: [
        {
          foodItemId: new mongoose.Types.ObjectId(),
          name: 'Biryani',
          price: 250,
          quantity: 2,
        },
      ],
      totalAmount: 500,
      status: 'Preparing',
      deliveryAddress: '123 Test Street, Delhi',
    });
    console.log('✅ Created test order with Preparing status');

    console.log('\n📊 Test Data Created:');
    console.log(`Restaurant ID: ${restaurant._id}`);
    console.log(`Order ID: ${order._id}`);
    console.log(`GPS: ${restaurant.gpsLocation.coordinates[1]}, ${restaurant.gpsLocation.coordinates[0]}`);
    console.log('\nDelivery partner should now see this order when using GPS near 28.6139, 77.2090');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDeliveryTest();
