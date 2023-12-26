const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res
    .status(404)
    .json({ message: "Please provide both username & password!" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  let booksP = new Promise((resovle, reject) => {
    resovle(JSON.stringify(books));
  });
  booksP.then((data) => {
    return res.status(200).json({ message: "success", data: data });
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let promise = new Promise((resovle, reject) => {
    const isbns = Object.keys(books);
    if (isbns.includes(req.params.isbn)) {
      resovle(JSON.stringify(books[req.params.isbn]));
    }
    reject("Book not found with isbn: " + req.params.isbn);
  });

  promise
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      return res.status(404).json({ error: error });
    });
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  // Convert the object into an array of books
  const booksArray = Object.values(books);

  let bks = await booksArray.filter((book) => {
    return book.author === req.params.author;
  });

  // Check if a book was found
  if (bks.length == 0) {
    return res
      .status(404)
      .json({ error: "Books not found for author " + req.params.author });
  }

  return res.status(200).json({ data: JSON.stringify(bks) });
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  // Convert the object into an array of books
  const booksArray = Object.values(books);

  let bk = await booksArray.find((book) => {
    return book.title === req.params.title;
  });

  // Check if a book was found
  if (!bk) {
    return res.status(404).json({ error: "Book not found." });
  }

  return res.status(200).json({ data: JSON.stringify(bk) });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  // Convert the object into an array of books
  const isbns = Object.keys(books);
  if (isbns.includes(req.params.isbn)) {
    return res
      .status(200)
      .json({ data: JSON.stringify(books[req.params.isbn].reviews) });
  }

  return res.status(404).json({
    error: "Reviews not found for book with isbn: " + req.params.isbn,
  });
});

module.exports.general = public_users;
