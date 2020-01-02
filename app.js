const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();


const app = express();
const PORT = process.env.PORT || 80;


//socket
const port = process.env.port || 80;


//const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true }));
app.use(express.static('public'));

app.listen(port, function () {
    console.log("server running at "+80);
});




app.get('/', function (req, res) {
  console.log("test")
  res.sendFile(__dirname+"/websiteclone/dhannoo/web2/index.html")
});


app.get('/share/*', function (req, res) {
  res.redirect("https://play.google.com/store?hl=en");
  // res.sendFile(__dirname+"/sportsappClone/dhannoo/web2/index.html")
});

app.get('/:one/:two',function(req,res){
  console.log(req.params.two)
  res.sendFile(__dirname+"/websiteclone/dhannoo/web2/"+req.params.one+ "/"+req.params.two);

});

app.get('/:one/:two/:three',function(req,res){
  console.log("thrree")
  res.sendFile(__dirname+"/websiteclone/dhannoo/web2/"+req.params.one+ "/"+req.params.two+"/"+req.params.three);
//  console.log(__dirname+"/sportsappClone/dhannoo/web2/"+req.params.one+ "/"+req.params.two+"/"+req.params.three);

});

app.get('/:one/:two/:three/:four',function(req,res){
  console.log("four")
  res.sendFile(__dirname+"/websiteclone/dhannoo/web2/"+req.params.one+ "/"+req.params.two+"/"+req.params.three+"/"+req.params.four);

});

app.get('/:one/:two/:three/:four/:five',function(req,res){
  console.log("five")
  res.sendFile(__dirname+"/websiteclone/dhannoo/web2/"+req.params.one+ "/"+req.params.two+"/"+req.params.three+"/"+req.params.four+"/"+req.params.five);

});

app.get('/:one/:two/:three/:four/:five/:six',function(req,res){
  console.log("six")
  res.sendFile(__dirname+"/websiteclone/dhannoo/web2/"+req.params.one+ "/"+req.params.two+"/"+req.params.three+"/"+req.params.four+"/"+req.params.five+"/"+req.params.six);

});
