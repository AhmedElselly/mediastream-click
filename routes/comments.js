const express = require('express');
const router = express.Router();


const {
	getUserById
} = require('../controllers/users');

const {
	getMediaById
} = require('../controllers/media');


const {
	create,
	read,
	list,
	getCommentById
} = require('../controllers/comments');

router.get('/read/:commentId', read);
router.get('/media/:mediaId', list);
router.post('/:userId/:mediaId', create);


router.param('userId', getUserById)
router.param('mediaId', getMediaById)
router.param('commentId', getCommentById)

module.exports = router;