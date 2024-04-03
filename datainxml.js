const mongoose = require('mongoose');
const builder = require('xmlbuilder');
const fs = require('fs');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  typeofpet: { type: String, required: true },
  name: { type: String, required: true },
  breed: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  description: { type: String },
  password: { type: String, required: true },
  gender: { type: String },
  type: { type: String },
  avatar: { type: String, default: 'avatar.png' },
});

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
});

const photoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  description: { type: String },
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Photo = mongoose.model('Photo', photoSchema);

// Connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/petsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    generateData();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Function to generate XML data for a given model and collection name
async function generateData() {
  const root = builder.create('bookstore').att('version', '1.0').att('encoding', 'UTF-8');
  await generateCollectionData(Admin, root, 'admin');
  await generateCollectionData(User, root, 'users');
  await generateCollectionData(Photo, root, 'photo');

  // Output XML to a file
  const xmlString = root.end({ pretty: true });
  const xmlFileName = 'data.xml';
  fs.writeFileSync(xmlFileName, xmlString, 'utf-8');
  console.log(`Generated ${xmlFileName}`);
}

// Function to generate XML data for a specific collection
async function generateCollectionData(model, root, collectionName) {
  const docs = await model.find().lean();
  docs.forEach((doc) => {
    const book = root.ele('book').att('category', collectionName);
    Object.entries(doc).forEach(([key, value]) => {
      if (key === '_id') return; // Skip the MongoDB ObjectId field
      if (Array.isArray(value)) {
        value.forEach((item) => {
          book.ele(key).txt(item);
        });
      } else {
        book.ele(key).txt(value);
      }
    });
  });
}
