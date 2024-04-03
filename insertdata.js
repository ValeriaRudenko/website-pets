const mongoose = require('mongoose');
const faker = require('faker');

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

const commentSchema = new mongoose.Schema({
  content: String,
  author: String,
  photo_id: String,
});
const photoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  description: { type: String },
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Photo = mongoose.model("Photo", photoSchema);

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/petsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Generate users, admins, and comments
    generateData();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

async function generateData() {
  try {
    // Generate 10 users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = new User({
        userId: faker.random.uuid(),
        typeofpet: faker.random.word(),
        name: faker.name.firstName(),
        breed: faker.random.word(),
        email: faker.internet.email(),
        description: faker.lorem.sentence(),
        password: faker.internet.password(),
        gender: faker.random.word(),
        type: faker.random.word(),
      });
      users.push(user);
    }
    await User.insertMany(users);
    console.log('Generated 10 users');

    // Generate 10 admins
    const admins = [];
    for (let i = 0; i < 10; i++) {
      const admin = new Admin({
        username: faker.internet.userName(),
        password: faker.internet.password(),
      });
      admins.push(admin);
    }
    await Admin.insertMany(admins);
    console.log('Generated 10 admins');


    // Generate 100 comments
    for(const photo of photos){
      const comments = [];
      for (let i = 0; i < 10; i++) {
        const comment = new Comment({
          content: faker.lorem.sentence(),
          author: faker.name.firstName(),
          photo_id: photo._id,
        });
        comments.push(comment);
      }
      await Comment.insertMany(comments);
      console.log('Generated 10 comments');
    }

    // Generate 10 photos
    const photos = [];
    for (let i = 0; i < 10; i++) {
      const photo = new Photo({
        imageUrl: `/uploads/${faker.random.uuid()}-Picture.png`,
        description: faker.lorem.sentence(),
      });
      photos.push(photo);
    }
    await Photo.insertMany(photos);
    console.log('Generated 10 photos');
    // Generate 100 comments
    for(const photo of photos){
      const comments = [];
      for (let i = 0; i < 10; i++) {
        const comment = new Comment({
          content: faker.lorem.sentence(),
          author: faker.name.firstName(),
          photo_id: photo._id,
        });
        comments.push(comment);
      }
      await Comment.insertMany(comments);
      console.log('Generated 10 comments');
    }
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error generating data:', error);
  }
}
