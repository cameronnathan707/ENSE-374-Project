const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
require("dotenv").config();

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();
// a common localhost test port
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

// connect to mongoose on port 27017
mongoose.connect("mongodb://localhost:27017/softRanked",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

//User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  affiliation: String
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const user1 = new User({
  username: "shahzil@gmail.com",
  password: "12345",
  affiliation: "Samsung"
});

const user2 = new User({
  username: "test@gmail.com",
  password: "123456",
  affiliation: "Apple"
});

// user1.save(); 
// user2.save(); 

// Ranking Schema 
const rankSchema = new mongoose.Schema({
  language: String,
  rankedBy: String,
  rank: Number
});

const Rank = new mongoose.model("Rank", rankSchema);

const rank1 = new Rank({
  language: "Swift",
  rankedBy: "shahzil@gmail.com",
  rank: 3
});

const rank2 = new Rank({
  language: "Ruby",
  rankedBy: "mark@gmail.com",
  rank: 5
});
const rank3 = new Rank({
  language: "C",
  rankedBy: "mark@gmail.com",
  rank: 1
});
const rank4 = new Rank({
  language: "Java",
  rankedBy: "mark@gmail.com",
  rank: 2
});
const rank5 = new Rank({
  language: "Python",
  rankedBy: "mark@gmail.com",
  rank: 5
});

//rank1.save(); 
// rank2.save(); 
// rank3.save(); 
// rank4.save(); 
// rank5.save(); 





app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/errors", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", async (req, res) => {
  const averages = await average();
  console.log("User " + req.body.username + " is attempting to log in");
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.render("home", { username: req.user.username, averages: averages });
      });
    }
  });
});

app.post("/signup", async (req, res) => {
  var auth = req.body["authentication"]; 
  const averages = await average();
  console.log("User " + req.body.username + " is attempting to register");
  
  if (auth == "rank2022") {
    User.register({ username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          passport.authenticate("local")(req, res, () => {
            res.render("home", { username: req.user.username, averages: averages });
          });
        }
      });
  }else{
    res.redirect("/");
  }
});


app.post("/home", async (req, res) => {
  const averages = await average();
  console.log(averages)
  if (req.isAuthenticated())              {
    username = req.user.username;
    res.render("home", { username: username, averages: averages });
  }
  else {
    res.render("home", { averages: averages });
  }
});

app.get("/logout", (req, res) => {
  console.log("logging out")
  req.logout(function(err) {
    if (err) { 
        return next(err); 
    }
    req.user=null
    res.redirect('/');
  });
});

app.get("/C.ejs", (req, res) => {
  if (req.isAuthenticated())             {
    username = req.user.username;
    res.render("C", { username: username});
  }
  else {
    res.render("C");
  }
});
app.get("/Java.ejs", (req, res) => {
  if (req.isAuthenticated())            {
    username = req.user.username;
    res.render("Java", { username: username});
  }
  else {
    res.render("Java");
  }
});

app.get("/JavaScript.ejs", (req, res) => {
  if (req.isAuthenticated())             {
    username = req.user.username;
    res.render("JavaScript", { username: username});
  }
  else {
    res.render("JavaScript");
  }
});
app.get("/Python.ejs", (req, res) => {
  if (req.isAuthenticated())              {
    username = req.user.username;
    res.render("Python", { username: username});
  }
  else {
    res.render("Python");
  }
});
app.get("/Ruby.ejs", (req, res) => {
  if (req.isAuthenticated())             {
    username = req.user.username;
    res.render("Ruby", { username: username});
  }
  else {
    res.render("Ruby");
  }
});
app.get("/Swift.ejs", (req, res) => {
  if (req.isAuthenticated())
  {
    username = req.user.username;
    res.render("Swift", { username: username});
  }
  else {
    res.render("Swift");
  }
});


app.post("/rank", async (req, res) => {

  const username = req.user.username;
  const lang = req.body["language"];
  const rank = req.body["Rating"];

  const query = { rankedBy: username, language: lang };
  const options = {};

  const record = await Rank.findOne(query, options);
  const averages = await average();

  // restricting user to only one ranking per language, but allowing them to update their ranking
  if (record != null) {
    const filter = { rankedBy: username, language: lang };
    const update = { $set: { rank: rank, }, };

    const result = await Rank.updateOne(filter, update);
    console.log(result);
    console.log("Updated Existing Rank");
  }
  else if (record == null) {
    const rank1 = new Rank({
      language: lang,
      rankedBy: username,
      rank: rank
    });

    rank1.save();
    console.log("New Rank Submitted");
  }

  res.render("home", { username: username, averages: averages });
});

app.get("/home.ejs", async (req, res) => {
  const averages = await average();

  res.render("home", { averages: averages });
});

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html"); 
});

// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});

function average() {
  return Rank.aggregate(
    [
      {
        $group:
        {
          _id: "$language",
          avgRank: { $avg: "$rank" }
        }
      },
      { $sort: { avgRank: -1 } }
    ]
  )
}