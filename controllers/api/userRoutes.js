const router = require('express').Router();
const { User, Thought } = require('../../models/index');

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
    const user = await User.findOne({ _id: req.params.id })
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
  // POST Request body
  /*
{
"username": "FooBar",
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
    await Thought.deleteMany({ _id: { $in: user.thoughts } });
    res.status(200).json({
      message: 'User associated thoughts have been sucessfully deleted!',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error, unable to delete user' });
  }
});

// Add a friend to a user.
router.post('/:userId/friends/:friendId', async (req, res) => {
  try {
    // This is the person being added as a friend
    const friend = await User.findByIdAndUpdate(
      { _id: req.params.friendId },
      { $addToSet: { friends: req.params.userId } },
      { new: true }
    );
    // this is the user who is gaining that friend.
    const user = await User.findByIdAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: friend._id } },
      { new: true }
    );
    if (!user || !friend) {
      return res.status(404).json({
        message: 'unable to find a user or a friend with provided IDs',
      });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Unable to add to friends!' });
  }
});

// Same code as before, jsut with the delete method, and $pull functionality
router.delete('/:userId/friends/:friendId', async (req, res) => {
  try {
    const friend = await User.findByIdAndUpdate(
      { _id: req.params.friendId },
      { $pull: { friends: req.params.userId } },
      { new: true }
    );
    const user = await User.findByIdAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: friend._id } },
      { new: true }
    );
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
