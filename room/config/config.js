var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database:"meet2"
});
con.connect(function(err) {
  if (err) console.log(err)
  console.log("Connected! ");
});
module.exports=con;