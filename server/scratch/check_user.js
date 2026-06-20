require('dotenv').config();
const mongoose = require('mongoose');
const { UserModel } = require('../src/models/User.model');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB.');
    const email = 'shravanishinde396@gmail.com';
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email "${email}" not found.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();
    console.log('-> Success: Upgraded user role to "admin".');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database error:', err);
    process.exit(1);
  });
