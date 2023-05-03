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

// Not Working
router.post('/', async (req, res) => {
  /* 
{
  "thoughtText": "Here's a cool thought...",
  "username": "lernantino",
  "userId": "5edff358a0fcb779aa7b118b"
}
*/
  try {
    const user = await User.findById(req.body.userId);
    if (!user && user.username !== req.body.username) {
      return res.status(404).json({ message: 'Could not find user!' });
    }
    const thought = await Thought.create(req.body);
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
      { $set: {thoughtText: req.body.thoughtText} },
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
    if (!thought) {
      return res.status(404).json({
        message: 'Could not find the thought associated with provided id!',
      });
    }
    res
      .status(200)
      .json({
        message: `Thought by ${thought.username} has been successfully deleted!`,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'An error has occured, unable to delete thought!' });
  }
});

module.exports = router;
