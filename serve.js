const app = require("express")();
require("./index.js");
app.get("/", (req,res)=>{
	res.sendFile(__dirname+"/public/index.html");
});
app.get("/other.html", (req,res)=>{
	res.sendFile(__dirname+"/public/other.html");
});
app.listen(3000);