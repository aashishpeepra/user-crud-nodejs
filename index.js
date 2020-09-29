const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require("./routes/user-routes");

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH");

  next();
});

app.use("/", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhj8w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log(`Connected to Database, Server up and running on ${PORT}`);
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
