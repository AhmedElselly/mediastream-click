const Comment = require('../models/comment');
const Media = require('../models/media');

module.exports = {
	getCommentById(req, res, next, id){
		Comment.findById(id).populate('author').exec((err, comment) => {
			if(err) return res.status(400).json({err});
			req.comment = comment;
			next();
		});
	},

	async create(req, res){
		const media = await req.media;
		const comment = await new Comment(req.body);
		comment.author = req.user;
		await comment.save();
		media.comments.push(comment);
		media.save((err, media) => {
			if(err) return res.status(400).json({err});
			return res.json(media);
		});
	},

	async read(req, res){
		const comment = await req.comment;
		return res.json(comment);
	},

	async list(req, res){
		const mediaComments = await Media.findById(req.media._id)
			.populate({path: 'comments', populate: {path: 'author'}})
			.select('comments');
		return res.json(mediaComments);
	}
}