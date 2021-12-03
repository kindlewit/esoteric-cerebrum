/**
 * All data to use for testing
 */

let singleUser = {
  username: 'test_user1',
  password: 'test_user1',
  display_name: 'User Tester I',
  email: 'user1@test.com'
};

let updatedSingleUser = {
  username: 'test_user1',
  password: 'test_user2',
  display_name: 'User Tester 1',
  email: 'user1@test.com'
};

let multiUsers = [
  {
    username: 'test_user2',
    password: 'test_user2',
    display_name: 'User Tester II',
    email: 'user2@test.com'
  },
  {
    username: 'test_user3',
    password: 'test_user3',
    display_name: 'User Tester The Third',
    email: 'user3@test.com'
  },
  {
    username: 'test_user4',
    password: 'test_user4',
    display_name: 'User Tester 4th',
    email: 'user4@test.com'
  }
];

let userWithoutUsername = {
  password: 'test_user5',
  display_name: 'User Tester 5',
  email: 'user5@test.com'
};

let userWithoutPassword = {
  username: 'test_user6',
  display_name: 'User Tester 6',
  email: 'user6@test.com'
};

let userWithoutEmail = {
  username: 'test_user7',
  password: 'test_user7',
  display_name: 'User Tester 7th'
};

let userWithChangeInUsername = {
  username: 'test_user220',
  password: 'test_user1',
  display_name: 'User Tester I',
  email: 'user1@test.com'
};

module.exports = {
  singleUser,
  multiUsers,
  userWithoutUsername,
  userWithoutPassword,
  userWithoutEmail,
  updatedSingleUser,
  userWithChangeInUsername
};
