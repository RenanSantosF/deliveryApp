if (process.env.NODE_ENV == "production") {
  module.exports = { mongoURI: "link"}
} else {
  module.exports = { mongoURI: "mongodb://localhost/Menu"}
}