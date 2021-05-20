require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const PORT = process.env.PORT || 8000;
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/mediastream', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to DB');
});

const userRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');
const commentRoutes = require('./routes/comments');

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(session({
	secret: 'I love Nastia',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/users', userRoutes);
app.use('/media', mediaRoutes);
app.use('/comments', commentRoutes);

app.listen(PORT, () => {
	console.log(`Server is on port ${PORT}`);
})