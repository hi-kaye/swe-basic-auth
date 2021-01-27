const express = require("express");
const app = express();
const {sequelize, User} = require('./models');
const session = require('express-session');
const bcrypt = require('bcrypt');

const sessionSettings = {
    secret: 'shhh',
    resave: false,
    saveUninitialized: true,
}

app.use(session(sessionSettings))
app.use(express.json());


const authLayer = async (req, res, next) => {
    if(!req.headers.authorization) {
        res.sendStatus(403);
    } else {
            next();
        }
    }

//test sessions
app.get('/', (req, res) => {
    if (req.session.views) {
      req.session.views++;
    }
    else {
      req.session.views = 1;
    }
    res.send(`${req.session.views} views`);
  })

//login
app.post('/login', authLayer, async (req,res) => {
    const auth = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
    const parts = auth.split(':')
    const username = parts.shift();
    const password = parts.join(':');
    const dbUsername = await User.findOne({where: {username: username}});
    const dbCheck =  await bcrypt.compare(password, dbUsername.password);
    if (!dbCheck) {
        res.sendStatus(404)
    } else {
        req.session.userId = user.id
        console.log(req.session)
        }
})

//logout
app.get('/logout', (req, res) => {
    if (req.session.userId) {
        req.session.destroy((err)=>{console.log('error')})
        res.send('Successfully logged out!')
    } else {
        res.send('You are not logged in!')
    }
})

//create user account
app.post('/users', async(req, res) => {
    const user = await User.create(req.body);
    res.send(user);
})

//list all users
app.get('/users', authLayer, async(req, res) => {
    const users = await User.findAll();
    console.log(users);
    res.send({users});
})

//access specific user with id
/* app.get('/users/:id', async(req, res) => {
    const single_user = await User.findByPk(req.params.id);
    console.log(single_user)
    single_user ? res.send(single_user) : res.sendStatus(404);
}); */

//access specific user with id with middleware
app.get('/users/:id', authLayer, async(req, res) => {
    const user = await User.findByPk(req.params.id);
    console.log(user);
    user ? res.send(user) : res.sendStatus(404);
})

//update user
app.put('/users/:id', authLayer, async(req, res) => {
    const user = await User.findByPk(req.params.id);
    await user.update(req.body);
    console.log(user)
    res.sendStatus(202);
})

//delete user
app.delete('/users/:id/delete', authLayer, async(req, res) => {
    const user = await User.findByPk(req.params.id);
    await user.destroy();
    res.sendStatus(202);
})

app.listen(3000, () => {
    sequelize.sync().then(() => console.log('Server ready'))
})