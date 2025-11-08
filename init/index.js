require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");

const mongoUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongoUrl);
}

const initDB = async () => {
  try {
    await Promise.all([
      Review.deleteMany({}),
      Listing.deleteMany({}),
      User.deleteMany({}),
    ]);

    const updatedData = initData.data.map((obj) => {
      // Build a clean doc matching schema; drop export-specific fields like _id and $oid refs
      const clean = {
        title: obj.title,
        description: obj.description,
        // Include image from seed if present so cards/show pages have visuals
        // (You can still upload/replace images later via the app.)
        ...(obj.image ? { image: obj.image } : {}),
        price: obj.price,
        location: obj.location,
        country: obj.country,
        category: obj.category,
      };

      // If geometry present in data, keep it; otherwise omit
      if (obj.geometry) {
        clean.geometry = obj.geometry;
      }
      return clean;
    });

    // 1) Create some owners and customers
    const ownerSeed = [
      { username: "host_aria", email: "aria@example.com", password: "Pass@123" },
      { username: "host_luke", email: "luke@example.com", password: "Pass@123" },
      { username: "host_zoe", email: "zoe@example.com", password: "Pass@123" },
    ];
    const customerSeed = [
      { username: "alice", email: "alice@example.com", password: "Pass@123" },
      { username: "bob", email: "bob@example.com", password: "Pass@123" },
      { username: "charlie", email: "charlie@example.com", password: "Pass@123" },
      { username: "diana", email: "diana@example.com", password: "Pass@123" },
    ];

    const owners = [];
    for (const u of ownerSeed) {
      const user = new User({ username: u.username, email: u.email });
      await User.register(user, u.password);
      owners.push(user);
    }

    const customers = [];
    for (const u of customerSeed) {
      const user = new User({ username: u.username, email: u.email });
      await User.register(user, u.password);
      customers.push(user);
    }

    // 2) Insert listings
    let listings = await Listing.insertMany(updatedData);

    // 3) Assign owners and create reviews
    const sampleComments = [
      "Great stay, highly recommend!",
      "Cozy place and friendly host.",
      "Beautiful location, would visit again.",
      "Clean and comfortable.",
      "Exactly as described.",
    ];

    for (const listing of listings) {
      // Assign a random owner
      const owner = owners[Math.floor(Math.random() * owners.length)];
      listing.owner = owner._id;

      // Create 2 random reviews from customers
      const revCount = 2;
      for (let i = 0; i < revCount; i++) {
        const author = customers[Math.floor(Math.random() * customers.length)];
        const rating = 3 + Math.floor(Math.random() * 3); // 3 to 5
        const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const review = await Review.create({ comment, rating, author: author._id });
        listing.reviews.push(review._id);
      }

      await listing.save();
    }

    console.log("DB is initialized with owners and sample reviews");
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
};

initDB();
