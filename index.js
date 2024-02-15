const express = require("express");
const app = express();
const pool = require("./db"); // Adjust the path if needed.
const cors = require("cors");
const http = require('http');
//const socketConfig = require("./socket/socket"); // Import the Socket.IO configuration
const pubnub = require('./pubnub/pubnubConfig');

require("dotenv").config();

var corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Add the HTTP methods you need
  allowedHeaders: ["Content-Type", "Authorization"], // Add the headers you want to allow
};

// Then use corsOptions in your CORS middleware setup
app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//app.use("/api/v1", baseRoutes);
app.use("/user", require("./routes/user/userRoute"));
app.use("/chats", require("./routes/chat//chatRoute2"));

//this part is for socket io, when use it change the app.listen to server.listen
// Import the Socket.IO configuration and pass the HTTP server to it
//const server = http.createServer(app);
//socketConfig(server);

// Start the server on a specific port (e.g., 3000).
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
