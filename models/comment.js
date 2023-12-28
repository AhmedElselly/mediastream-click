const mongoose  = require('mongoose');
const {Schema} = mongoose;

const commentSchema = new Schema({
	text: {
		type: String,
		required: true
	},

	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);