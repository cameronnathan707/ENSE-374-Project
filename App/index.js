const express = require("express");
const mongoose = require("mongoose");

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();

// connect to mongoose on port 27017
mongoose.connect( "mongodb://localhost:27017/lab8", 
                { useNewUrlParser: true, 
                  useUnifiedTopology: true});

/*  
add migration scripts here

*/

app.set("view engine", "ejs");

// a common localhost test port
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/login.html");
  });

app.post("/home",(req,res)=> {
  res.sendFile(__dirname + "/views/home.html")
});

// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});
