$(document).ready(function() {
  $(document).on("pageshow", "[data-role='page']", function() {
    if ($($(this)).hasClass("header_default")) {
      $('<header data-theme="b" data-role="header"><h1></h1><a href="#" class="ui-btn-left ui-btn ui-btn-inline ui-btn-icon-notext ui-mini ui-corner-all ui-icon-back" data-rel="back">Back</a><a href="#mydialog" class="ui-btn-right ui-btn ui-btn-inline ui-btn-icon-notext ui-mini ui-corner-all ui-icon-info">Info</a></header>')
        .prependTo( $(this) )
        .toolbar({ position: "fixed" });
        $("[data-role='header'] h1").text($(this).jqmData("title"));
    } //if header_default
    $.mobile.resetActivePageHeight();

    if ($($(this)).hasClass("footer_default")) {
      $('<footer data-theme="b" data-role="footer" data-position="fixed"><nav data-role="navbar"><ul><li><a href="#home" class="ui-btn ui-icon-home ui-btn-icon-top">Home</a></li><li><a href="#blog" class="ui-btn ui-icon-edit ui-btn-icon-top">Blog</a></li><li><a href="#videos" class="ui-btn ui-icon-video ui-btn-icon-top">Videos</a></li><li><a href="#photos" class="ui-btn ui-icon-camera ui-btn-icon-top">Photos</a></li><li><a href="#tweets" class="ui-btn ui-icon-comment ui-btn-icon-top">Tweets</a></li></ul></nav></footer>')
        .appendTo($(this))
        .toolbar({position: "fixed"});
    }

    var current = $(".ui-page-active").attr('id');

    $("[data-role='footer'] a.ui-btn-active").removeClass("ui-btn-active");
    $("[data-role='footer'] a").each(function() {
      if ($(this).attr('href') === '#' + current) {
        $(this).addClass("ui-btn-active");
      }
    }); //each link in navbar

  }); //show_page
}); //document.ready


function listPosts(data) {
  var output = '<form class="ui-filterable"><input id="searchposts" data-type="search"></form>';

  output += '<ul data-role="listview" data-filter="true" data-input="#searchposts">';
  $.each(data.posts, function(key, val) {

    var tempDiv = document.createElement("tempDiv");
    tempDiv.innerHTML = val.excerpt;
    $("a", tempDiv).remove();
    var excerpt = tempDiv.innerHTML;

    output += '<li>';
    output += '<a href="#blogpost" onclick = "showPost(' + val.id + ')">';
    output += (val.thumbnail) ?
      '<img src="' + val.thumbnail + '" alt="' + val.title + '">':
      '<img src="images/viewsourcelogo.png" alt="View Source Logo">';
    output += '<h3>' + val.title + "</h3>";
    output += '<p>' + excerpt + "</p>";
    output += '</a>';
    output += '</li>';
  }); //go through each post
  output += "</ul>";
  $('#postlist').html(output);
} //listPosts

function showPost(id) {
  $.getJSON('http://iviewsource.com/?json=get_post&post_id=' + id + '&callback=?', function(data) {
    var output = '<h3>' + data.post.title + '</h3>';
    output += data.post.content;
    $('#mypost').html(output);
  });
}

function listVideos(data) {
  var output = '';
    for (var i=0; i<data.feed.entry.length; i++) {
      var title = data.feed.entry[i].title.$t;
      var thumbnail = data.feed.entry[i].media$group.media$thumbnail[0].url;
      var description = data.feed.entry[i].media$group.media$description.$t;
      var id = data.feed.entry[i].id.$t.substring(38);

      var blocktype = ((i % 2)===1) ? 'b': 'a';

      output += '<div class="ui-block-' + blocktype + '">';
      output += '<h3 class="movietitle">' + title + '</h3>';
      output += '<a href="#videoplayer" data-transition="fade" onclick = "playVideo(\'' + id + '\',\'' + title + '\',\'' + escape(description) + '\')">';
      output += '<img src="' + thumbnail + '" alt=" ' + title + '">';
      output += '</a>';
      output += '</div>';
    } // entries loop
    $('#videoList').html(output);
} //listVideos

function playVideo(id, title, description) {
  var output = '<iframe src="http://www.youtube.com/embed/' + id + '?wmode=transparent&amp;HD=0&amp;rel=0&amp;showinfo=0;controls=1&amp;autoplay=1" frameborder="0" allowfullscreen></iframe>';
  output += '<h3>' + title + '</h3>';
  output += '<p>' + unescape(description) + '</p>';
  $('#myplayer').html(output);
}

function jsonFlickrFeed(data) {
  var output = '';

  for (var i=0; i < data.items.length; i++) {
    var title = data.items[i].title;
    var link = data.items[i].media.m.substring(0,56);
    var blocktype = 
      ((i % 4) === 3) ? 'd':
      ((i % 4) === 2) ? 'c':
      ((i % 4) === 1) ? 'b':
      'a';
    output += '<div class="ui-block-' + blocktype + '">';
    output += '<a href="#showphoto" data-transition="fade" onclick="showPhoto(\'' + link + '\',\'' + title + '\')">';
    output += '<img src="' + link + '_q.jpg" alt="' + title + '">';
    output += '</a>';
    output += '</div>';
  }
  $('#photolist').html(output);
}

function showPhoto(link, title) {
  var output = '<a href="#photos" data-transition="fade">';
  output +='<img src="' + link +'_b.jpg" alt="' + title + '">';
  output +='</a>';
  $('#myphoto').html(output);
}

function listTweets (data) {
  var output = '<ul data-role="listview">';
  $.each(data, function(key, val) {
    var text = data[key].text;
    var thumbnail = data[key].user.profile_image_url;
    thumbnail = thumbnail.substring(0, thumbnail.length - 12) + '_bigger.jpeg';
    var name = data[key].user.name;

    //Parse URLs in twitter text
    text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(i) {
      var url=i.link(i);
      return url;
    });

    //Parse @mentions in twitter text
    text = text.replace(/[@]+[A-Za-z0-9-_]+/g, function(i) {
      var item = i.replace("@",'');
      var url=i.link("http://twitter.com/" + item);
      return url;
    });

    //Parse #hashtags in twitter text
    text = text.replace(/[#]+[A-Za-z0-9-_]+/g, function(i) {
      var item = i.replace("#",'%23');
      var url=i.link("http://twitter.com/search?q=" + item);
      return url;
    });

    output += '<li>';
    output += '<img src="' + thumbnail + '" alt="Photo of ' + name + '">';
    output += '<div>' + text + '</div>';
    output += '</li>';
  }); //Go through each data
  output += '</ul>';
  $('#tweetlist').html(output);
} //listTweets