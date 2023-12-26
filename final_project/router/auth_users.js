const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let res = users.find((user) => {
    return user.username == username;
  });
  if (res) {
    return true;
  }
  return false;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      let accessToken = jwt.sign({ data: password }, "fingerprint_customer", {
        expiresIn: 60 * 60 * 60,
      });
      req.session.authorization = {
        accessToken,
        username,
      };
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(404).json({ message: "User Not Found" });
    }
  }
  return res
    .status(404)
    .json({ message: "Please provide both username & password!" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const usr = req.session.authorization.username;
  const review = req.query.review;
  const isbn = req.params.isbn;
  const all_current_reviews = Object.values(books[isbn].reviews);
  let filtered_reviews = all_current_reviews.filter((review) => {
    review.author != usr;
  });
  filtered_reviews.push({ author: usr, review: review });
  books[isbn].reviews = filtered_reviews;

  return res.status(200).json({
    message: "successfully added a review for book with isbn: " + isbn,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const usr = req.session.authorization.username;

  const isbn = req.params.isbn;
  const all_current_reviews = Object.values(books[isbn].reviews);
  let filtered_reviews = all_current_reviews.filter((review) => {
    review.author != usr;
  });

  books[isbn].reviews = filtered_reviews;
  return res.status(200).json({
    message:
      "Deleted the review of user: " + usr + " on book with isbn: " + isbn,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
