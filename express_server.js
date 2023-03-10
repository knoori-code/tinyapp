const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require("./helper");
const { urlDatabase, users } = require("./database");

app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["This is a key"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(express.urlencoded({ extended: true }));

// endpoint to handle registration form data
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send("Status Code: 400 - Please enter an email and password");
  }

  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Status Code: 400 - The email already exists.");
  }

  // Generate new user and store info as an object in users object
  const id = generateRandomString();
  const email = req.body.email;

  // Generate hashed password and store in users object
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    hashedPassword,
  };
  // set userid cookie
  req.session.user_id = id;
  res.redirect("/urls");
});

// New login endpoint which responds with login template
app.get("/login", (req, res) => {
  // if logged in, redirect user to urls page
  const id = req.session.user_id;
  if (id) {
    return res.redirect("/urls");
  }

  const templateVars = { user: users[id] };
  res.render("login", templateVars);
});

// Route to get registration page
app.get("/register", (req, res) => {
  // if logged in, redirect user to urls page
  const id = req.session.user_id;
  if (id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[id] };
  res.render("register", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    return res.send("The short url does not exist");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  // if not logged in, redirect from urls/new to login page
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[id] }; // updating cookie values
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("You must be logged in");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist");
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[req.params.id]) {
    return res.send("This URL does not belong to you");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  // if user not logged in, provide error message when trying to access /urls page
  const id = req.session.user_id;
  if (!id) {
    return res.send(
      'You must be logged in to view URLs: <a href="/login">Please Login</a>'
    );
  }

  const urls = urlsForUser(id, urlDatabase);

  const templateVars = { urls, user: users[id] };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  // if not logged in, responds with HTML message that they cannot shorten urls
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(400).send("Cannot shorten URLs if not logged in");
  }

  if (!req.body.longURL) {
    return res.send(
      'The URL field cannot be empty: <a href="/urls/new">Please try again</a>'
    );
  }

  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("You must be logged in");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist");
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[req.params.id]) {
    return res.send("This URL does not belong to you");
  }

  if (!req.body.longURL) {
    return res.status(400).send("Cannot be empty");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("You must be logged in");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist");
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[req.params.id]) {
    return res.send("This URL does not belong to you");
  }

  // Delete specific key from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Adding to login field and saving cookie
app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email, users);
  if (!userObj) {
    return res
      .status(403)
      .send(
        'Status Code: 400 - The email does not exist: <a href="/login">Please try again</a>'
      );
  }

  if (!bcrypt.compareSync(req.body.password, userObj.hashedPassword)) {
    return res.send(
      'The password entered is not correct: <a href="/login">Please try again</a>'
    );
  }
  req.session.user_id = userObj.id;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
