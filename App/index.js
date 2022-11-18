const express = require("express");
const mongoose = require("mongoose");

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();
// a common localhost test port
const port = 3000;
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
// connect to mongoose on port 27017
mongoose.connect( "mongodb://localhost:27017/softRanked", 
                { useNewUrlParser: true, 
                  useUnifiedTopology: true}
);

//User Schema
const userSchema = new mongoose.Schema ({                      
  username:   String, 
  password:   String,
  affiliation: String
});

const User = new mongoose.model ( "User", userSchema ); 

const user1 = new User ({                                  
  username:   "shahzil@gmail.com", 
  password:   "12345",
  affiliation: "Samsung"
});

const user2 = new User ({                               
  username:   "test@gmail.com", 
  password:   "123456",
  affiliation: "Apple"
});

//user1.save(); 
//user2.save(); 

// Ranking Schema 
const rankSchema = new mongoose.Schema ({
  language: String, 
  rankedBy: String, 
  rank: Number
});

const Rank = new mongoose.model ("Rank", rankSchema); 

const rank1 = new Rank ({
  language: "C++", 
  rankedBy: "shahzil@gmail.com", 
  rank: 3
});

const rank2 = new Rank ({
  language: "C++", 
  rankedBy: "mark@gmail.com", 
  rank: 4
});

// rank1.save(); 
// rank2.save(); 


// Language Schema 
// const langSchema = new mongoose.Schema ({
//   language: String, 
//   avgRank: String, 
// });

// const Lang = new mongoose.model ("Lang", langSchema); 

// const lang1 = new Lang ({
//   language: "C++", 
//   avgRank: 3.5
// });

// const lang1 = new Lang ({
//   language: "C++", 
//   avgRank: 4
// });



/*  
add migration scripts here

*/


app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.post("/errors", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", async(req,res) => { 
   
  var currUser = req.body["username"];
  var currPass = req.body["password"]; 

  const query = {username: currUser};
  const options = {};
  const userExists = await User.findOne(query, options); 

  if (userExists == null || userExists === 0)
  {
    res.render ("errors", {error: "Incorrect Username"});
  }

  const users = await User.find(); 
  for (const user in users)
  {   
    if (users[user].username == currUser)
    {
      console.log("correct userName"); 
      if (users[user].password == currPass)
      {
        res.redirect(307, "/home");              
      }
      else 
      {
        console.log("Incorrect Password");  
        res.render ("errors", {error: "Incorrect Password"});
      }
    }
  }
});

app.post("/signup", async(req,res) => { 
   
  var currUser = req.body["username"];
  var currPass = req.body["password"]; 
  var cPass = req.body["cPassword"];
  var affiliation = req.body["affiliation"];   
  var auth = req.body["authentication"]; 

  const users = await User.find(); 

  if(currUser == "" || currPass == "" || cPass == "" || affiliation == "" || auth == "")
  {
    res.render ("errors", {error: "Input Fields cannot be empty"});
  }
  else if (auth == "rank2022") //(auth == process.env.AUTHENTICATION_KEY)  <== didnt work
  {
    const users = await User.find(); 
    var newUser = true; 

    for (user in users)
    {
      if (users[user].username == currUser)
      {
        newUser = false; 
      }
    }

    if (currPass != cPass)
    {
      res.render ("errors", {error: "Entered Passwords do not match"});
    }

    if (newUser & currPass == cPass)
    {
      const user = new User ({
        username: currUser, 
        password: currPass,
        affiliation: affiliation
      }); 

      user.save(); 
      res.redirect(307, "/home");
    }
    else
    {
      console.log("Email already in use");  
      res.render ("errors", {error: "Email Alreay in Use"}); 
    }
  }
  else
  {
    console.log("Authentication Failure"); 
    res.render ("errors", {error: "Authentication Failure"});
  }
});


app.post("/home",(req,res)=> {  
  
  if (req.body["username"] == undefined)            // this fixes the disappearence of "logged in as ..." when page reloads > Problem b/c each page render is specific to each user
  {
    username = req.body["username"];   
  }
  else
  {
    username = req.body["username"];
  }
  
  res.render("home", {username: username}); 
});

app.post("/logout",(req,res)=> {  
  //console.log(username);
  res.sendFile(__dirname + "/login.html");
});

app.get("/detail.ejs", async(req, res) => {

  res.render("detail", {username: username}); 
});

app.get("/viewDetail.ejs", async(req, res) => {
  res.render("viewDetail"); 
});


app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html"); 
});

app.post("/rank",async(req,res)=> {  
  
  const username = req.body["username"]; 
  const lang = req.body["language"]; 
  const rank = req.body["Rating"]; 

  const query = {rankedBy: username, language: lang}; 
  const options = {};  

  const record = await Rank.findOne(query, options); 

  // restricting user to only one ranking per language, but allowing them to update their ranking
  if (record != null)
  {
    const filter = {rankedBy: username, language: lang};
    const update = { $set: {rank: rank,},};

    const result = await Rank.updateOne(filter, update);
    console.log(result);
    console.log("Updated Existing Rank");   
  }
  else if (record == null)
  {
    const rank1 = new Rank ({
      language: lang, 
      rankedBy: username, 
      rank: rank
    });
  
    rank1.save(); 
    console.log("New Rank Submitted"); 
  }
  
  //handle averaging here, helpful site: https://www.mongodb.com/docs/manual/reference/operator/aggregation/avg/
  // save averaged record into a const variable and send it to render the home route
  // then in home.ejs, replace all avg with the new averages from passed variable

  res.render("home", {username: username},); 
});

app.get("/viewHome.ejs",(req,res)=> {   
//app.post("/viewHome",(req,res)=> {  
 
  // handle avgeraging here again like in the /rank route


  res.render("viewHome");
});


// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});
