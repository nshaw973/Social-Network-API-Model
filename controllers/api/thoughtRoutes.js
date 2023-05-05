const router = require('express').Router();
const { Thought, User } = require('../../models/index');

// Gets all thoughts
router.get('/', async (req, res) => {
  try {
    // finds all thoughts and removes the __v from the retrieved data, to remove bloat.
    const thoughts = await Thought.find().select('-__v');
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(500).json({ message: 'Could not retrive thoughts!' });
  }
});

// Gets single thought with id
router.get('/:id', async (req, res) => {
  try {
    // Finds thoughts based on a thoughts id number
    const thought = await Thought.findById({ _id: req.params.id });
    res.status(200).json(thought);
  } catch (err) {
    res.status(500).json({ message: 'Unable to find requested thought!' });
  }
});

// Create Thoughts
router.post('/', async (req, res) => {
  try {
    // This creates a thought
    const thought = await Thought.create(req.body);
    // Since we need to add the thought to someone, it adds the thoughts id to the users thoughts array
    const user = await User.findByIdAndUpdate(
      { _id: req.body.userId },
      // $addToSet adds the id to the thoughts array
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
    //Finds and updates the thought based on the id in the params
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.id },
      // $set changes the thoughtText body and updates the value
      { $set: { thoughtText: req.body.thoughtText } },
      // Makes sure the thoughtText matches the validators in the model and doesn't violate the min and max length that the thought can be.
      { runValidators: true, new: true }
    );
    // shows the updated thought.
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
    // Looks for the thought and deletes is
    const thought = await Thought.findOneAndRemove(req.params.id);
    // We also need to find the user who created the thought and delete the thought from the thoughts array
    const user = await User.findOneAndUpdate(
      // looks for the username that matches the user that created the thought, since usernames are suppose to be unique
      { username: thought.username },
      // $pull deletes the thought from the array by removing the id
      { $pull: { thoughts: thought._id } },
      { new: true }
    );
    // Checks to see if the thought or user doesnt exist. if neither exists, then returns an error.
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
// Create new reaction for thought
router.post('/:thoughtId/reactions', async (req, res) => {
  try {
    // Since reactions arent models, we instead update the reactions array in the thoughts.
    const thought = await Thought.findOneAndUpdate(
      // finds the thought being associated in the parameters.
      { _id: req.params.thoughtId },
      // $addToSet adds the reaction created in the body to the reactions array.
      { $addToSet: { reactions: req.body } },
      { new: true }
    );
    // returns the thought with the reactions array updated with the new reaction
    res.status(200).json(thought);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error, unable to post reaction to thought' });
  }
});

// Delete Reaction
router.delete('/:thoughtId/reactions', async (req, res) => {
  try {
    // Looks for thought and updates the array
    const thought = await Thought.findByIdAndUpdate(
      { _id: req.params.thoughtId },
      // $pull deletes the reaction that was added based on the reactionsId. The reactionId isn't in the parameters, but instead its in the body.
      { $pull: { reactions: { reactionId: req.body.reactionId } } },
      { new: true }
    );
    //if the thought doesn't exist then it returns an error.
    if (!thought) {
      return res.status(404).json({ message: 'Thought or Reaction not found!' });
    }
    res.status(200).json({ message: `Reaction has been deleted!` });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error, unable to post reaction to thought' });
  }
});

module.exports = router;
