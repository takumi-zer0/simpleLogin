const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongoDB = 'mongodb://127.0.0.1/my_database';
mongoose.connect(mongoDB);

const saltRounds = 10;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'error'));
db.once('open', () => {
    console.log('connected')
});


var passportSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
})

var passportModel = mongoose.model('passportModel', passportSchema)


app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    passportModel
        .findOne({username: req.body.username})
        .then(user =>  {
            console.log(user.password)

            if(bcrypt.compareSync(req.body.password, user.password)){
                console.log("PASSED")
                res.send('PASSED')
            }else{
                console.log("WRONG")
                res.send('WRONG')
            }
        });
})

app.get('/signup', (req, res)=> {
    res.render('signup')
})

app.post('/signup', (req, res) => {
    const {username, password, password2} = req.body
    if(password != password2) {
        console.log("its not the same")
    }

    var hashpass = bcrypt.hashSync(password, saltRounds)

    var newUser = new passportModel({username: username, password: hashpass})
    newUser.save((err) => {
        if(err) console.log(err)
    })
    res.redirect('/login')
})

app.get('/getall', (req, res) => {
    passportModel
        .find({})
        .exec(function (err, users) {
            if (err) return handleError(err);
            console.log(users)
        });

})

app.listen(3000)