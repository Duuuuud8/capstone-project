const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

app.get("/", (req, res) => {
    res.json({message: "Priority Notes API Running"});
});

module.exports = app;