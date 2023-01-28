// Looks up users by their email. Returns object with user information if email found.
const getUserByEmail = function (email, userDatabase) {
  for (const user in userDatabase) {
    if (email === userDatabase[user].email) {
      return userDatabase[user];
    }
  }
  return null;
};

// Generates a 6 character long random string to be used for user IDs and cookies
function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newString = "";
  let index = 0;
  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * characters.length);
    newString += characters[index];
  }
  return newString;
}

const urlsForUser = (id, urlDatabase) => {
  const result = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      result[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
