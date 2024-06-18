const express = require("express");


const mongoose = require("mongoose");
const mysql = require("mysql");
const helmet = require("helmet");
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");

const path = require("path");
require("dotenv").config();
console.log(process.env); // remove this after you've confirmed it is working



mongoose
  .connect(process.env.CLUSTER_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Configuration de la connexion à la base de données
// const db = mysql.createConnection({
  // host: `${process.env.HOST}`,
  // user: `${process.env.USER}`,
  // password: `${process.env.PASSWORD}`,
  // database: `${process.env.DATA_BASE}`
// });


// // Connexion à la base de données
// db.connect((err) => {
//   if (err) {
//       console.error('Error connecting to MySQL database:', err);
//       // console.log(process.env.HOST);
//       // console.log(process.env.USER);
//       // console.log(process.env.PASSWORD);
//       // console.log(process.env.DATA_BASE);
//       return;
//   }
//   console.log('Connected to MySQL database.');
// });
  
const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/books", booksRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));


module.exports = app;


