const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	}
});

userSchema.plugin(passportLocalMongoose, {
	usernameField: 'email'
});

module.exports = mongoose.model('User', userSchema);