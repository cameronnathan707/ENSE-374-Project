const express = require("express");
const { writeJson, readJson } = require("./public/js/jsonSyncing");
const mongoose = require("mongoose");
const { initTasks, initUsers } = require("./public/js/migrate");

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();

// connect to mongoose on port 27017
mongoose.connect( "something", 
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
    res.sendFile(__dirname + "/home.ejs");
  });

// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});
