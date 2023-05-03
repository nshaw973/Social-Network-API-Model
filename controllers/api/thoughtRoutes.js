const router = require('express').Router();

router.post('/:id/thoughts', async (req, res) => {
    console.log(req.body)
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { thoughts: req.body } },
      { runValidators: true, new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Unable to add a thought!' });
  }
});

module.exports = router;