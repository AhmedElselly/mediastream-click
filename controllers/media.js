const Media = require('../models/media');
const fs = require('fs');
const mongoose = require('mongoose');
const formidable = require('formidable');
let gridfs;

mongoose.connection.on('connected', () => {
	gridfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
});

module.exports = {
	getMediaById(req, res, next, id){
		Media.findById(id)
			.populate('author')
			.populate({path: 'comments', populate: {path: 'author'}})
			.exec(async (err, media) => {
			if(err) return res.status(400).json({error: 'No media found'});
			req.media = media;
			let files = await gridfs.find({filename: media._id}).toArray();
			console.log(files)
			if(!files[0]){
				return res.status(400).json({error: 'No video found'});
			}
			req.file = files[0];
			next();
		});
	},

	async create(req, res){
		let form = new formidable.IncomingForm();
		form.keepExtension = true;
		form.parse(req, async (err, fields, files) => {
			if(err) return res.status(400).json({err});
			let media = await new Media(fields);
			media.author = await req.user;

			if(files.video){
				let writestream = gridfs.openUploadStream(media._id, {
					contentType: files.video.type || 'binary/octet-stream'
				});
				fs.createReadStream(files.video.path).pipe(writestream);
			}

			media.save((err, media) => {
				if(err){
					return res.status(400).json({error: 'can not save media!'});
				}
				return res.json(media);
			});
		});
	},

	async video(req, res){
		const range = req.headers['range'];
		if(range && typeof range === 'string'){
			console.log('in range string')
			const parts = range.replace(/bytes=/, '').split('-');
			const partialstart = parts[0];
			const partialend = parts[1];
			const start = parseInt(partialstart, 10);
			const end = partialend ? parseInt(partialend, 10) : req.file.length - 1;
			const chunksize = (end - start) + 1;

			res.writeHead(206, {
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize,
				'Content-Range': 'bytes ' + start + '-' + end + '/' + req.file.length,
				'Content-Type': req.file.contentType
			});

			let downloadStream = await gridfs.openDownloadStream(req.file._id, {
				start, 
				end: end + 1
			});

			downloadStream.pipe(res);
			downloadStream.on('error', () => {
				res.sendStatus(404)
			});
			downloadStream.on('end', () => {
				res.end()
			});
			
		} else {
			res.header('Content-Length', req.file.length)
			res.header('Content-Type', req.file.contentType)

			let downloadStream = await gridfs.openDownloadStream(req.file._id);
			downloadStream.pipe(res);
			downloadStream.on('error', () => {
				res.sendStatus(404)
			})
			downloadStream.on('end', () => {
				res.end()
			})
		}
	},

	async read(req, res){
		return res.json(req.media);
	},

	async list(req, res){
		const videos = await Media.find().populate('author', '_id username email');
		if(!videos){
			return res.status(400).json({error: 'no list'});
		}

		return res.json(videos);
	},

	async listByUser(req, res){
		const videos = await Media.find({author: req.user._id}).populate('author', '_id username email');
		return res.json(videos);
	},

	async listRelated(req, res){
		const media = await Media.find({_id: {$ne: req.media}, genre: req.media.genre})
			.limit(4)
			.sort('-views')
			.populate('author', '_id email username')
		return res.json(media);			
	},

	async increaseViews(req, res, next){
		await Media.findByIdAndUpdate(req.media._id, {
			$inc: {'views': 1}
		}, {new: true}).exec();

		next()
	}
}