const express = require('express');
const router = express.Router();
const controller = require('../Controllers/ReorderController');

router.get('/reorders', controller.list);
router.post('/reorders', controller.create);
router.patch('/reorders/:id', controller.update);
router.delete('/reorders/:id', controller.remove);

module.exports = router;


