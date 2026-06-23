const mongoose = require("mongoose");

const dbURI = 
    process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

module.exports = mongoose;