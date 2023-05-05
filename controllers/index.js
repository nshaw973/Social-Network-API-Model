const router = require('express').Router();
const apiRoutes = require('./api');

router.use('/api', apiRoutes);
// Error handling incase the user types out the wrong route, or if something goes wrong with the server.
router.use((req, res) => res.status(500).send('Nothing Here!'));

module.exports = router;