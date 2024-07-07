


// config/mongoDB.js

const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = function connectToMongoDB(app) {
  mongoose.set("debug", true);

  mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  mongoose.connection.on("error", (err) => {
    console.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected");
  });

  // Configure and use express-session
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }), // Pass session object directly to MongoStore
      cookie: { maxAge: 3600000 },
    })
  );
};