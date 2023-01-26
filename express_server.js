const express = require("express");
const cookieParser = require("cookie-parser");
const { response } = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs")

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

const urlDatabase = {};

const users = {
  KVPWs6: { id: 'KVPWs6', email: 'obiwan@gmail.com', password: '22543' }

}

const urlsForUser = (id) => {
  // for loop, access userID 
  const result = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      result[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return result
}

// Returns user object
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

  // Generate hashed password and store in users object
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    hashedPassword
  }
  // set userid cookie
  res.cookie('user_id', id);
  res.redirect("/urls")
  
})

// New login endpoint which responds with login template
app.get("/login", (req, res) => {
  // if logged in, redirect user to urls page
  if (req.cookies['user_id']) {
    return res.redirect("/urls")
  }

  const templateVars = {user: users[req.cookies['user_id']]}
  res.render("login", templateVars)
})

// Route to get registration page
app.get("/register", (req, res) => {
  // if logged in, redirect user to urls page
  if (req.cookies['user_id']) {
    return res.redirect("/urls")
  }

  const templateVars = {user: users[req.cookies['user_id']]}
  res.render("register", templateVars);
});
 

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  if (urlDatabase[req.params.id] === undefined) {
    return res.send("The short url does not exist")
  }

  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});


app.get("/urls/new", (req, res) => {
  // if not logged in, redirect from urls/new to login page
  if (!req.cookies['user_id']) {
    return res.redirect("/login")
  }

  const templateVars = {user: users[req.cookies['user_id']]};  // updating cookie values
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send("You must be logged in")
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist")
  }
  const userUrls = urlsForUser(req.cookies['user_id'])
  if (!userUrls[req.params.id]) {
    return res.send("This URL does not belong to you")
  }

  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
})

app.get("/urls", (req, res) => {
  // if user not logged in, provide error message when trying to access /urls page
  if (!req.cookies['user_id']) {
    return res.send("You must be logged in to view URLs")
  }

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
  // if not logged in, responds with HTML message that they cannot shorten urls
  if (!req.cookies['user_id']) {
    return res.status(400).send("Cannot shorten URLs if not logged in");
  }

  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }

  // console.log(urlDatabase)
  res.redirect(`/urls/${id}`)
});

app.post("/urls/:id", (req, res) => {
  // Put 3 if conditions here
  if (!req.cookies['user_id']) {
    return res.send("You must be logged in")
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist")
  }
  const userUrls = urlsForUser(req.cookies['user_id'])
  if (!userUrls[req.params.id]) {
    return res.send("This URL does not belong to you")
  }

  if (!req.body.longURL) {
    return res.status(400).send("Cannot be empty");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {
  // Put 3 if conditions here
  if (!req.cookies['user_id']) {
    return res.send("You must be logged in")
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist")
  }
  const userUrls = urlsForUser(req.cookies['user_id'])
  if (!userUrls[req.params.id]) {
    return res.send("This URL does not belong to you")
  }

  // Delete specific key from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

// logout route
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')  
  res.redirect("/login")
})

// Adding to login field and saving cookie
app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email);
  if (!userObj) {
    return res.status(403).send("Status Code: 400 - The email does not exist")
  }

  if (req.body.password !== userObj.password) {
    return res.status(403).send("Status Code: 400 - The password is incorrect")
  }
  res.cookie('user_id', userObj.id);
  console.log(req.cookies['user_id'])
  return res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
