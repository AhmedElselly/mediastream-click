const mongoose = require('mongoose');
const {Schema} = mongoose;

const mediaSchema = new Schema({
	title: {
		type: String,
		required: true
	},

	description: String,
	genre: String,
	views: {
		type: Number,
		default: 0
	},

	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},

	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Comment'
		}
	]
}, {timestamps: true});

module.exports = mongoose.model('Media', mediaSchema);