var fs = require('fs');
var template = require('lodash.template');
var paganate = require('paganate');
var eve = require('dom-events');
var elClass = require('element-class');
var removeEl = require('remove-elements');
var config = require('./config.json');

/* set optional host, token options from config */
var opts = {};
if (config.host) opts.host = config.host;

/* initialize flatsheet with options */
var flatsheet = require('flatsheet')(opts);
var postList = [];

/* set number of posts per page for pagination */
var limit = config.limit;
var total;

/* initialize pagination */
var page = paganate({ limit: limit });

/* listen for page event to page through items */
page.on('page', function (page, offset) {
  /* get items from the local db */
  getItems(offset);
});

/* find the #get-items button */
var getItemsEl = document.getElementById('get-items');

/* listen for click event on #get-items button */
eve.on(getItemsEl, 'click', function(e) {
  page.next();
  e.preventDefault();
});

/* find #main-content */
var mainEl = document.getElementById('main-content');

/* pull in html template */
var postListSource = fs.readFileSync('views/client/post-list.html', 'utf8');

/* kick off the application */
requestData(function () {
  page.page(0);
});    



/*
* helper functions
*/

/* request data from flatsheet, plop it into indexeddb */
function requestData (callback) {
  flatsheet.sheet(config.sheet, function (error, response){
    if (error) callback(error);
    postList = response.rows.filter(isPublished).reverse();
    total = postList.length;
    if (callback) callback();
  });
}

/* get items from indexeddb based on pagination offset */
function getItems (offset) {
  var posts = postList.slice(offset, offset + limit);
  var listEl = createEl('post-list', postListSource, { posts: posts, baseurl: config.baseurl });
  mainEl.appendChild(listEl);
  if (total <= offset + limit) elClass(getItemsEl).add('hidden');
}

/* create the html for a view */
function createEl (slug, source, data) {
  var compiled = template(source);
  var html = compiled(data);
  var el = document.createElement('div');
  el.className = slug;
  el.innerHTML = html;
  return el;
}

function isPublished (obj) {
  return obj.published === 'true';
}