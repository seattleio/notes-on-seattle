var flatsheet = require('flatsheet')();
var express = require('express')
var app = express();

var config = require('./config.json');

app.locals.baseurl = config.baseurl;
app.use('/public', express.static(__dirname + '/public'));

app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');

app.get('/', function (req, res){
  res.render('index.ejs', { posts: res });
});

app.get('/:slug', function (req, res){
  flatsheet.sheet(config.sheet, function (err, sheet) {
    var slug = req.params['slug'];

    sheet.rows.forEach(function (row) {
      if (row.slug == slug) {
        return res.render('post.ejs', { post: row });
      }
    })
  });
});

app.listen(process.env.PORT || 3000);