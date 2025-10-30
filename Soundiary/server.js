const express = require('express');
const app = express();

app.listen(8080, function() { // 8080 port for test
    console.log('listening on 8080')
});

app.get('/', function(query, response) { // index page load
    response.sendFile(__dirname + '/public/index.html')
});

app.get('/pet', function(query, response) { // url test
    response.send('Meow');
});
