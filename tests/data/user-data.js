let singleUser = {
  username: 'test_user1',
  password: 'test_user1',
  display_name: 'User Tester I',
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

module.exports = {
  singleUser,
  multiUsers
};
