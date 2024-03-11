const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  return users.reduce((acc, curr) => { return acc || curr.username === username }, false);
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.reduce((acc, curr) => { return acc || (curr.username === username && curr.password === password) }, false);
}

// /customer/login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  }

  const accessToken = jwt.sign({ data: password }, "access", {
    expiresIn: 60 * 60,
  });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in.", accessToken });
});

// Add a book review
// /customer/auth/:isbn
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const review = req.body.review;
  const isbn = req.params.isbn;
  if (!review) {
    return res.status(400).json({ message: "Review is empty!" });
  }

  if (!books[isbn]) {
    return res.status(400).json({ message: "invalid ISBN." });
  }

  books[isbn].reviews[user] = review;

  return res.status(200).json({ message: "Book review updated.", book: books[isbn] });
});

// delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const isbn = req.params.isbn;


  if (!books[isbn]) {
    return res.status(400).json({ message: "invalid ISBN." });
  }
  if (!books[isbn].reviews[user]) {
    return res
      .status(400)
      .json({ message: `${user} hasn't submitted a review for this book.` });
  }
  delete books[isbn].reviews[user];
  return res.status(200).json({ message: "Book review deleted.", book: books[isbn] });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;