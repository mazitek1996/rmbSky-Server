

// app.js
const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectToMongoDB = require("./config/mongoDB");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server);

connectToMongoDB(app);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Say hello to  RMBSky...");
});


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// const customerRouter = require("./routes/customer-router");
// const staffRouter = require("./routes/staff-router");
const adminRouter = require("./router/admin-router");
const systemRouter = require("./router/system-router");

// const pushNotificationRouter = require("./routes/pushNotificationRouter");


// customerRouter(app);
// staffRouter(app);
adminRouter(app);
systemRouter(app);




const port = process.env.PORT || 7000;
server.listen(port, () => {
  console.log(`QC Server is listening on port ${port}`);
});

module.exports = { app, server, io };