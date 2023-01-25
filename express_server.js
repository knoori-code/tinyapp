const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let newString = '';
  let index = 0;
  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * characters.length);
    newString += characters[index];
  }
  return newString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Route to get registration page
app.get("/register", (req, res) => {
  res.render("register");
});
 
app.post('/register', (req, res) => {
  res.send("Registration request")
})

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies['username']};
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username']};
  res.render("urls_show", templateVars);
})

app.get("/urls", (req, res) => {
  // Testing if username populates in header.
  // console.log(req.cookies['username'])
  const templateVars = {urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
})

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`)
});

app.post("/urls/:id", (req, res) => {
  if (!req.body.longURL) {
    return res.status(400).send("Cannot be empty");
  }
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {
  // Delete specific key from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

// logout route
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
})

// Adding to login field and saving cookie
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls")
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});