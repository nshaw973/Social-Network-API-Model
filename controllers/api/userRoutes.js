const router = require('express').Router();
const { User, Thought } = require('../../models/index');

// Get all users
router.get('/', async (req, res) => {
  try {
    // find is used to find ALL the users, the .select('-__v') removes the __v which is the version of the document.
    const users = await User.find().select('-__v');
    res.status(200).json(users);
  } catch (err) {
    //error handling
    res.status(500).json({ message: 'Error, unable to retrieve users' });
  }
});

//Get a single User
router.get('/:id', async (req, res) => {
  try {
    // Finds a user based on the id added in the parameter
    const user = await User.findOne({ _id: req.params.id })
      // Populate the thoughts path in the User model, as well as friends.
      // Except in friends we are removing thoughts and thoughts for friends, to prevent overloading the info being retrieved.
      .populate({ path: 'thoughts', select: '-__v' })
      .populate({ path: 'friends', select: '-__v -thoughts -friends' })
      .select('-__v');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Unable to find user with provided id!' });
  }
});

//Post new User
router.post('/', async (req, res) => {
  try {
    // Simple create method
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
    // Finds user through the parameter /:id
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      // $set is updating the username and email values
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
        },
      },
      // runs the validators we gave in the model, by checking if its a valid email, and if the username is unique.
      { runValidators: true, new: true }
    );
    // Error handling to make sure the user passes the validations.
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
    // This just looks for the user via the id in the parameter, and deletes it.
    const user = await User.findOneAndRemove({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'No student with ID was found' });
    }
    //Added functionality to delete assignments related to user
    // The user has the thought IDs in the thoughts array, and it looks for all the thoughts with the IDs associated inside the user.thoughts array.
    await Thought.deleteMany({ _id: { $in: user.thoughts } });
    res.status(200).json({
      message: 'User, and associated thoughts have been sucessfully deleted!',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error, unable to delete user' });
  }
});

// Add a friend to a user and the user also gets added to the friend.
router.post('/:userId/friends/:friendId', async (req, res) => {
  try {
    // This is the person being added as a friend
    // $addToSet, adds data to the array, where $set updates a data value.
    const friend = await User.findByIdAndUpdate(
      { _id: req.params.friendId },
      // Adding the userId into the friends array for the friend
      { $addToSet: { friends: req.params.userId } },
      { new: true }
    );
    // this is the user who is gaining that friend.
    const user = await User.findByIdAndUpdate(
      { _id: req.params.userId },
      // adding the friends id to the friends array for the user.
      { $addToSet: { friends: friend._id } },
      { new: true }
    );
    // if either one of the users is non existent then it returns an error
    if (!user || !friend) {
      return res.status(404).json({
        message: 'unable to find a user or a friend with provided IDs',
      });
    }
    res.status(200).json({ message: 'Users are now friends!' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to add to friends!' });
  }
});

// Same code as before, just with the delete method, and $pull functionality
router.delete('/:userId/friends/:friendId', async (req, res) => {
  try {
    const friend = await User.findByIdAndUpdate(
      { _id: req.params.friendId },
      // $pull is being used to remove the user from the friend
      { $pull: { friends: req.params.userId } },
      { new: true }
    );
    const user = await User.findByIdAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: friend._id } },
      { new: true }
    );
    // same error handling as before.
    if (!user || !friend) {
      return res.status(404).json({
        message: 'unable to find a user or a friend with provided IDs',
      });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Unable to remove friends!' });
  }
});

module.exports = router;
