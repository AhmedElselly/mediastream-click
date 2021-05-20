const express = require('express');
const router = express.Router();


const {
	getUserById
} = require('../controllers/users');

const {
	create,
	increaseViews,
	getMediaById,
	listRelated,
	video,
	list,
	listByUser,
	read
} = require('../controllers/media');

router.get('/', list);
router.get('/video/credentials/:mediaId', increaseViews, read);
router.get('/video/:mediaId', video);
router.get('/list/by-user/:userId', listByUser);
router.get('/list/related/:mediaId', listRelated);
router.post('/create/:userId', create);


router.param('userId', getUserById);
router.param('mediaId', getMediaById);

module.exports = router;