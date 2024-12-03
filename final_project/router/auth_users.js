const express = require('express');
const jwt = require('jsonwebtoken'); // For JWT generation
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid (returns boolean)
const isValid = (username) => {
  return !users.some(user => user.username === username); // Returns true if username doesn't exist
};

// Check if the username and password match an existing record (returns boolean)
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Login a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, "your_secret_key", { expiresIn: "1h" }); // Replace with your secret key
    req.session.accessToken = token; // Save JWT in session
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get ISBN from route
  const { review } = req.body; // Get review from request body
  const username = req.user?.username; // Get username from session (JWT middleware)

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) book.reviews = {}; // Initialize reviews if not present
  book.reviews[username] = review; // Add or update review by username

  return res.status(200).json({
    message: `Review by user '${username}' added/updated successfully`,
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get ISBN from route
  const username = req.user?.username; // Get username from session (JWT middleware)

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username]; // Delete the review by the current user
    return res.status(200).json({
      message: `Review by user '${username}' deleted successfully`,
      reviews: book.reviews
    });
  } else {
    return res.status(404).json({ message: "Review not found for the current user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;