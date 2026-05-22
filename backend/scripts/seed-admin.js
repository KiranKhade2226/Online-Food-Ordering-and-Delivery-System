require('dotenv').config();
const dns = require('dns');
// prefer public DNS servers for SRV lookups when local DNS blocks them
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if not supported in environment
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await mongoose.connection.collection('users').updateOne(
    { email: adminEmail },
    {
      $set: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log(`Admin ready: ${adminEmail}`);
  await mongoose.disconnect();
};

seedAdmin().catch((error) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});
