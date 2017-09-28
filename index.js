const path = require("path");
const express = require('express')
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.json());
app.use(express.static('static'));

//app.get('/', (req, res) => {
//	res.sendFile(path.join(__dirname + '/index.html'));
//})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
	
