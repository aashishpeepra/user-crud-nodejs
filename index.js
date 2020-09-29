const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require("./routes/user-routes");

app.use(bodyParser.json());

app.use("/", userRoutes);

app.listen(PORT);
