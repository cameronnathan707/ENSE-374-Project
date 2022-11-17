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
  else if (auth == "rank2022") //(auth == process.env.AUTHENTICATION_KEY)
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

app.get("/detail.ejs", (req, res) => {
  res.render("detail", {username: username}); 
});

// app.get("/home.ejs", (req, res) => {
  
//   console.log(req.body); 
//   if (req.body["username"] == undefined)            // this fixes the disappearence of "logged in as ..." when page reloads > Problem b/c each page render is specific to each user
//   {
//     username = req.body["username"];   
//   }
//   else
//   {
//     username = req.body["username"];
//   }
  
//   res.render("home", {username: username}); 

//   // res.redirect('back'); 
// });

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});


// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});
