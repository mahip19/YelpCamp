const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
// this is goning to add on a field for password
// it adds username, hash and salt field, hashed password
// and salt value
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
