const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
	getUserById(req, res, next, id){
		User.findById(id).exec((err, user) => {
			if(err) return res.status(400).json({error: 'No such user with that ID'});
			req.user = user;
			next();
		});
	},

	async register(req, res){
		const foundUser = await User.findOne({email: req.body.email});
		if(foundUser) return res.status(400).json({error: 'Email already registered, please try to login!'})
		const user = await new User(req.body);
		await user.setPassword(req.body.password);
		user.save((err, user)=>{
			if(err) return res.status(400).json({err});
			return res.json(user);
		});
	},

	async login(req, res){
		const foundUser = await User.findOne({email: req.body.email});
		if(!foundUser) return res.status(400).json({error: 'Email not found!'})
		const {user} = await User.authenticate()(req.body.email, req.body.password);
		if(!user) return res.status(400).json({error: 'Email and password do not match'})
		const token = await jwt.sign({email: user.email, username: user.username, _id: user._id}, process.env.SECRETKEY);
 		res.cookie('t', token, {expire: new Date() + 9999});
 		return res.json({user, token});
 	},

 	logout(req, res){
		res.clearCookie('t');
		res.json({message: 'User logged out'});
	}
}