var PORT = process.env.PORT || 8080;

var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname + "/public"));

app.listen(PORT);

console.log("Express app listening in port: " + PORT);
