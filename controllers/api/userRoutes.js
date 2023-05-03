const router = require('express').Router();
const { User } = require('../../models/index');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error, unable to retrieve users' });
  }
});

//Get a single User
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id }).select('-__v');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Unable to find user with provided id!' });
  }
});

//Post new User
router.post('/', async (req, res) => {
// pOST Request body
/*
{
"username": "Foo Bar",
"email": "foo@bar.com"
} 
*/
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error, unable to add new user' });
  }
});
// Update current user
// Can update only the username or the email
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
        },
      },
      { runValidators: true, new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Unable to find user!' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Unable to update user' });
  }
});

// Delete a user by _id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndRemove({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'No student with ID was found' });
    }
    //Add functionality to delete assignments related to user

    res.status(200).json({ message: 'User has been sucessfully deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Error, unable to delete user' });
  }
});

module.exports = router;
