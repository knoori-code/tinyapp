// Looks up users by their email. Returns object with user information if email found. 
const getUserByEmail = function(email, userDatabase) { 
  for (const user in userDatabase) {
    if (email === userDatabase[user].email) {
      return userDatabase[user]
    }
  }
  return null
}

module.exports = getUserByEmail;