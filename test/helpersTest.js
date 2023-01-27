const { assert } = require('chai');

const getUserByEmail  = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUser = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedUser)
  });

  it('should return a value of null if the email is not in testUsers', function() {
    const user = getUserByEmail("apple@example.com", testUsers)
    const expectedUser = null
    assert.equal(user, expectedUser)
  });
});