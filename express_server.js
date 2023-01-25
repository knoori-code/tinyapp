const express = require("express");
const cookieParser = require("cookie-parser");
const { response } = require("express");
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

const users = {
  KVPWs6: { id: 'KVPWs6', email: 'obiwan@gmail.com', password: '22543' }

}

const getUserByEmail = function(email) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user]
    }
  }
  return null
}

// endpoint to handle registration form data
app.post('/register', (req, res) => {
  // check if email or passwords entered are empty string
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Status Code: 400 - Please enter an email and password")
  }

  if (getUserByEmail(req.body.email)) {
    return res.status(400).send("Status Code: 400 - The email already exists.")
  }

  // Generate new user and store info as an object in users object
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = {
    id,
    email,
    password
  }
  // console.log(users)
  // set userid cookie
  console.log(users)
  res.cookie('user_id', id);
  res.redirect("/urls")
  
})

// Route to get registration page
app.get("/register", (req, res) => {
  res.render("register");
});
 

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};  // updating cookie values
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
})

app.get("/urls", (req, res) => {
  // Testing if username populates in header.
  // console.log(req.cookies['username'])
  const templateVars = {urls: urlDatabase, user: users[req.cookies['user_id']]};
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