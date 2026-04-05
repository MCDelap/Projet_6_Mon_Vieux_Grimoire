const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator").default;

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Veuillez saisir une adresse email valide",
    ],
  },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
