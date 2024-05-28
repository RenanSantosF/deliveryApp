if (process.env.NODE_ENV == "production") {
  module.exports = { mongoURI: "mongodb+srv://renanSantosF:bAPjXNANrmLQwjvb@menu.hkhlajn.mongodb.net/?retryWrites=true&w=majority&ssl=true" };
} else {
  module.exports = { mongoURI: "mongodb://localhost/Menu" };
}
