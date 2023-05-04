const router = require('express').Router();
const { Thought, User } = require('../../models/index');

router.get('/', async (req, res) => {
  try {
    const thoughts = await Thought.find().select('-__v');
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(500).json({ message: 'Could not retrive thoughts!' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const thought = await Thought.findById({ _id: req.params.id });
    res.status(200).json(thought);
  } catch (err) {
    res.status(500).json({ message: 'Unable to find requested thought!' });
  }
});

// Create Thoughts
// Thought Body for Insomnia
/* 
{
  "thoughtText": "Here's a cool thought...",
  "username": "lernantino",
  "userId": "5edff358a0fcb779aa7b118b"
}
*/
router.post('/', async (req, res) => {

  try {
    const thought = await Thought.create(req.body);
    const user = await User.findByIdAndUpdate(
      { _id: req.body.userId },
      { $addToSet: { thoughts: thought._id } },
      { new: true }
    );
    // Makes sure there is a user, and that the username matches the username provided in the thought post
    if (!user || user.username !== req.body.username) {
      return res
        .status(404)
        .json({ message: 'Thought was created, but user was not found!' });
    }
    res.status(200).json(thought);
  } catch (err) {
    res.status(500).json({ message: 'Unable to add a thought!' });
  }
});

//Update Thought
router.put('/:id', async (req, res) => {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { thoughtText: req.body.thoughtText } },
      { runValidators: true, new: true }
    );
    res.status(200).json(thought);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error has occured, unable to update thought!' });
  }
});

// Delete Thought
router.delete('/:id', async (req, res) => {
  try {
    const thought = await Thought.findOneAndRemove(req.params.id);
    const user = await User.findOneAndUpdate(
      { username: thought.username },
      { $pull: { thoughts: thought._id } },
      { new: true }
    );
    if (!thought || !user) {
      return res.status(404).json({
        message: 'Could not find the thought associated with provided id!',
      });
    }
    res.status(200).json({
      message: `Thought by ${thought.username} has been successfully deleted!`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'An error has occured, unable to delete thought!' });
  }
});

// Reaction Routes
// Reaction Body for Insomnia
/* 
{
"reactionBody": "text goes here", 
"username": "username"
}
*/
router.post('/:thoughtId/reactions', async (req, res) => {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { new: true }
    );
    res.status(200).json(thought)
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error, unable to post reaction to thought' });
  }
});
// Delete Reaction
router.delete('/:thoughtId/reactions', async (req, res) => {
  try {
    const thought = await Thought.findByIdAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { reactionId: req.body.reactionId} } },
      { new: true }
    );
    console.log(thought)
    if (!thought) {
      res.status(404).json({ message: 'Thought or Reaction not found!' })
    }
    res.status(200).json({ message: `Reaction has been deleted!` })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error, unable to post reaction to thought' });
  }
});

module.exports = router;
