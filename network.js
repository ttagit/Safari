const TWITTER_USER_ID_STORAGE_KEY = "UserId";

var Networks = function() {};

Networks.prototype.getAccessToken = function() {
  var accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  return _.isString(accessToken) ? accessToken : null;
};

Networks.prototype.getAccessTokenSecret = function() {
  var accessTokenSecret = localStorage.getItem(ACCESS_TOKEN_SECRET_STORAGE_KEY);

  return _.isString(accessTokenSecret) ? accessTokenSecret : null;
};

Networks.prototype.getUserID = function() {
  var userid = Number(localStorage.getItem(TWITTER_USER_ID_STORAGE_KEY));

  return (_.isNumber(userid) && !_.isNaN(userid)) ? userid : null;
};

Networks.prototype.parseToken = function(data) {
  if (_.isString(data)) {
    var parsedToken = {};

    data.split('&').forEach(function(token) {
      var kv = token.split('=');

      parsedToken[kv[0]] = kv[1];
    });

    return parsedToken;
  }

  return null;
};

Networks.prototype.login = function() {

  var message = {
    "method": "GET",
    "action": "https://api.twitter.com/oauth/request_token",
    "parameters": {
      "oauth_consumer_key": CONSUMER_KEY,
      "oauth_signature_method": "HMAC-SHA1"
    }
  };

  var accessor = {
    "consumerSecret": CONSUMER_SECRET
  };

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  $.get(
    OAuth.addToURL(message.action, message.parameters),
    $.proxy(
      function(data) {
        var params = this.parseToken(data);
        var token = params.oauth_token;
        var secret = params.oauth_token_secret;

        message.action = "https://api.twitter.com/oauth/authorize";
        message.parameters.oauth_token = token;

        accessor.oauth_token_secret = secret;

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        this.request_token = token;
        this.request_token_secret = secret;
        safari.application.activeBrowserWindow.openTab().url = OAuth.addToURL(message.action, message.parameters)
        //
        //window.open();
      },
      this
    )
  );
};

Networks.prototype.sign = function(pin, cb) {
  var requestToken = this.request_token;
  var requestTokenSecret = this.request_token_secret;

  delete this.request_token;
  delete this.request_token_secret;

  var message = {
    "method": "GET",
    "action": "https://api.twitter.com/oauth/access_token",
    "parameters": {
      "oauth_consumer_key": CONSUMER_KEY,
      "oauth_signature_method": "HMAC-SHA1",
      "oauth_token": requestToken,
      "oauth_verifier": pin
    }
  };

  var accessor = {
    "consumerSecret": CONSUMER_SECRET,
    "tokenSecret": requestTokenSecret
  };

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  $.ajax({
    "type": "GET",
    "url": OAuth.addToURL(message.action, message.parameters),
    "success": $.proxy(function(data) {
      var params = this.parseToken(data);

      this.save(params.oauth_token, params.oauth_token_secret, params.user_id);

      cb(true);
    }, this),
    "error": function(xhr, status, error) {
      cb(false);
    }
  });
};

Networks.prototype.save = function(accessToken, accessTokenSecret, userid) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(ACCESS_TOKEN_SECRET_STORAGE_KEY, accessTokenSecret);
  localStorage.setItem(TWITTER_USER_ID_STORAGE_KEY, userid);
};

Networks.prototype.isAuthenticated = function() {
  return !_.isNull(this.getAccessToken()) && !_.isNull(this.getAccessTokenSecret()) && _.isNumber(this.getUserID()) ? true : false;
};



Networks.prototype.showSentiments = function(elm,loading,url,cb){
  var message_div = $("<div>").attr("id","b_content_div").attr("class","col-xs-12 border");
  var sentiments_div = $("<div>").attr("id","b_sentiments_div").attr("class","col-xs-12 border");
  var entities_div = $("<div>").attr("id","b_entities_div").attr("class","col-xs-12");

  $(loading).addClass('show').removeClass('hide');

  message_div.append( $("<h4>").text("Page behaviour and entities") );

  //sentiments
  $.ajax({
    type: "GET",
    url: "http://ttagit.demo.hatchitup.com:8990/api/sentiments?url="+url,
    success: function(data){      

      sentiments_div.append(
             $("<p>").html("The website seems quite <i>"+data.type + "</i>  in behaviour for the above entities with a score of " + parseInt(parseFloat(data.score)*100) +"%"),
             $("<p>").html("and for more on page behaviour and entities <a href='http://en.wikipedia.org/wiki/Sentiment_analysis' target='_blank'>click here</a>")
      );

      getEntities();
      
      
    },
    error: function(xhr, status, error) {
      //alert(JSON.stringify(xhr));
      //alert(JSON.stringify(message));
      //alert(JSON.stringify(error));
      //alert(OAuth.addToURL(message.action, message.parameters));
      //alert(encodeURIComponent($(tweetInput).find("textarea").val() +" " + url).replace(/'/g,"%27").replace(/"/g,"%22"));

      if (xhr.status === 401) {
        //localStorage.removeItem("access_token");

        //$(elm.querySelector("#twitter-login")).css("display", "block");
      }
    },
    dataType: "json"
  });
  
  var getEntities = function(){
    //entities
    $.ajax({
      type: "GET",
      url: "http://ttagit.demo.hatchitup.com:8990/api/entities?url="+url,
      success: function(data){


          //entities
          $.ajax({
            type: "GET",
            url: "http://ttagit.demo.hatchitup.com:8990/api/concepts?url="+url,
            success: function(conceptsData){

              $(loading).addClass('hide').removeClass('show');        
              $(elm).append(message_div,sentiments_div,entities_div);
              cb(data,conceptsData);
              
            },
            dataType: "json"
          });
          

        
        
      },
      dataType: "json"
    });

      
  }
  

  
}


Networks.prototype.fetchFacebook = function(elm,inputButton,loading,url){

  
  var like = null;
  var share = null;
  var content_div = $("<div>").attr("id","fb_content_div").attr("class","col-xs-12 border");
  var post_div = $("<div>").attr("id","fb_post_div").attr("class","col-xs-12");


  var createLike = function(){
    
    $(loading).addClass('show').removeClass('hide');
    $.ajax({
      type:"POST",
      url:"https://graph.facebook.com/me/og.likes?"+localStorage.getItem('fbToken'),
      data :{
        object:url
      },
      success:function(data){
        like.attr({"id":data.id});
        $(loading).addClass('hide').removeClass('show');
        like.text("Unlike this article/page on Facebook");

      },
      error:function(err){
        
        $(loading).addClass('hide').removeClass('show');
        like.text("Some error, click to retry.");
      }
    });
  }
  var removeLike = function(id){
    
    $(loading).addClass('show').removeClass('hide');
    $.ajax({
      type:"DELETE",
      url:"https://graph.facebook.com/"+id+"?"+localStorage.getItem('fbToken'),
      success:function(data){
        like.removeAttr("id");
        $(loading).addClass('hide').removeClass('show');
        like.text("Like this article/page on Facebook");

      },
      error:function(err){
        
        $(loading).addClass('hide').removeClass('show');
        like.text("Some error, click to retry.");
      }
    });
  }
  

  like =  
      $("<a>")
        .attr({"href":"javascript:void(0)","data-original-title":"Like"}).text(" Like this article/page on Facebook.")
        .prepend(
              $('<i>').attr("class","fa fa-star")
        ).click(function(){
          if(typeof(like.attr('id')) === "undefined")
            createLike();
          else
            removeLike(like.attr('id'));
        });
  
  share =  
    $("<p>").append(

      $("<a>")
        .attr({"target":"_blank","href":"http://www.facebook.com/sharer/sharer.php?u="+url})
        .text(" Share this article/page on Facebook.")
        .prepend(
              $('<i>').attr("class","fa fa-share")
        )
  )
  
  //append like
  content_div.append(like,share);


  var fbMsg = $("<div>").attr({'id':'fbMsg'});
  var postInput = $("<div>").attr("id","newstatues").attr("class","col-xs-12").append(
    
    fbMsg,

    $("<form>").attr("role","form").append(

      $("<div>").attr("class","form-group").append(
        $("<textarea>").attr("class","inputbox form-control").attr("placeholder","What do you think of this article/page?"),
        $("<button>").html("Post this on facebook.").attr("id","sendPost").attr("class","btn btn-default pull-right")
        .click(function(){
              sendPost();
              return false;
          })
        )

      )
  );

  var deletePost = function(id){
    $(loading).addClass('show').removeClass('hide');
    $.ajax({
        type: "DELETE",
        url: "https://graph.facebook.com/"+id+"/?"+localStorage.getItem('fbToken'),
        success:function(){
          $(loading).addClass('hide').removeClass('show');
          $(fbMsg).html("Deleted");
          setTimeout(function() {
            $(fbMsg).fade().html("");
          }, 2000);
        },
        error : function(){
          $(fbMsg).html("There was some error while removing the post.");
        }
    })
  }

  var sendPost = function(){
      $(loading).addClass('show').removeClass('hide');

      $.ajax({
        type: "POST",
        url: "https://graph.facebook.com/v2.3/me/feed?"+localStorage.getItem('fbToken'),
        data : {
          message : $(postInput).find("textarea").val(),
          link : url
        },
      success: function(data){
        
        var fetchPostedDataUrl = "https://graph.facebook.com/"+data.id+"/?"+localStorage.getItem('fbToken');
        
        $.ajax({
          type:"GET",
          url:fetchPostedDataUrl,
          success:function(posted_json){

            $(loading).addClass('hide').removeClass('show');
            $(fbMsg).append(
              $("<div>").attr({"class":"row"}).append(

                $("<div>").attr({"class":"col-xs-12 border"}).append(
                  $("<h4>").text("The following message was posted to your timelime."),
                  $("<div>").append(

                    $("<p>").text(posted_json.message),

                    $("<div>").attr({"class":"row"}).append(

                      $("<div>").attr({"class":"col-xs-4"}).append(
                        $("<img>").attr({"src":posted_json.picture})
                        ),
                      $("<div>").attr({"class":"col-xs-8"}).append(
                        $("<h5>").text(posted_json.name),
                        $("<p>").text(posted_json.description),
                        $("<small>").text(posted_json.caption),
                        $("<button>").attr({"class":"btn btn-xs btn-danger pull-right"}).text("Delete this post").click(function(){
                          deletePost(posted_json.id)
                        }),
                        $("<a>").attr({"class":"btn btn-xs btn-info pull-right","style":"margin:0px 5px 0px 0px;","target":"_blank","href":"https://www.facebook.com/"+posted_json.from.id}).text("Your timeline")
                        )

                      )


                    )
                  )

                )
              );
              setTimeout(function() {
                $(fbMsg).fade().html("");
              }, 2000);
              $(postInput).find("textarea").val('');
          }
        })

        
          
      },
      error: function(xhr, status, error) {
        $(loading).addClass('hide').removeClass('show');
        alert(JSON.stringify(xhr));
        //alert(JSON.stringify(message));
        //alert(JSON.stringify(error));
        //alert(OAuth.addToURL(message.action, message.parameters));
        //alert(encodeURIComponent($(tweetInput).find("textarea").val() +" " + url).replace(/'/g,"%27").replace(/"/g,"%22"));

        if (xhr.status === 401) {
          //localStorage.removeItem("access_token");

          //$(elm.querySelector("#twitter-login")).css("display", "block");
        }
      },
      dataType: "json"
    });
  };


  
  

  post_div.append(postInput);


  var logout_fb = $("<button>").attr({'class':'btn btn-default btn-xs'})
  .text(" Logout")
  .append(
    $("<i>").attr({'class':'fa fa-user-times'})
    )
  .click(function(){
    localStorage.removeItem('fbToken');
    alert("You are now logged out from facebook");
    window.reload();
  })

  //analytics
  $.ajax({
    type: "GET",
    url: "https://api.facebook.com/method/links.getStats?urls="+url+"&format=json",
    success: function(data){
      $(loading).addClass('hide').removeClass('show');

      var analytics = data[0];

      $(loading).addClass('hide');

      $.ajax({
        type: "GET",
        url:"https://graph.facebook.com/me?"+localStorage.getItem('fbToken'),
        success: function(data){

          //

          var dp = $("<img>").attr({"src":"https://graph.facebook.com/"+data.id+"/picture"}).attr({"class":"pull-right","style":"padding:2px 8px 0px 0px;"});
          var name = $("<div>").append(
            $("<p>").text("Hi,"+data.first_name),
            logout_fb
            ).attr({"class":"pull-right"})
          var analytics_div = $("<div>").attr("id","analytics_div").attr("class","col-xs-12 border");
          analytics_div.append(

            $("<div>").attr("class","row").append(

              $("<div>").attr("class","col-xs-8").append(
                  $("<h5>").text("Facebook analytics for the page"),//title
                  $("<ul>").attr('class','stats').append( // list of analytics
                    $("<li>").text(analytics.share_count + " shares,"),
                    $("<li>").text(analytics.like_count + " likes,"),
                    $("<li>").text(analytics.comment_count + " comments"),
                    $("<li>").text(analytics.click_count+ " clicks")
                    )
                ),
              $("<div>").attr("class","col-xs-4").append(name,dp)
              )
            
            )

          content_div.append(analytics_div);
          $(elm).append(analytics_div,content_div,post_div);
        }
      })

          
    },
    error: function(xhr, status, error) {
      //alert(JSON.stringify(xhr));
      //alert(JSON.stringify(message));
      //alert(JSON.stringify(error));
      //alert(OAuth.addToURL(message.action, message.parameters));
      //alert(encodeURIComponent($(tweetInput).find("textarea").val() +" " + url).replace(/'/g,"%27").replace(/"/g,"%22"));

      if (xhr.status === 401) {
        //localStorage.removeItem("access_token");

        //$(elm.querySelector("#twitter-login")).css("display", "block");
      }
    },
    dataType: "json"
  });
  

  
  
};


Networks.prototype.fetchTwitter = function(elm,inputButton,loading,login,url) {
  var accessToken = this.getAccessToken();
  var accessTokenSecret = this.getAccessTokenSecret();

  var q = encodeURIComponent(url).replace(/'/g,"%27").replace(/"/g,"%22");

  var message = {
    "method": "GET",
    "action": "https://api.twitter.com/1.1/search/tweets.json?q="+q,
    "parameters": {
      "oauth_consumer_key": CONSUMER_KEY,
      "oauth_signature_method": "HMAC-SHA1",
      "oauth_token": accessToken,
      "count": 100
    }
  };

  var accessor = {
    "consumerSecret": CONSUMER_SECRET,
    "tokenSecret": accessTokenSecret
  };

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var tweetInput = $("<div>").attr("id","newTweet").attr("class","col-xs-12").append(

    $("<form>").attr("role","form").append(

      $("<div>").attr("class","form-group").append(
        $("<textarea>").attr("class","inputbox form-control").attr("placeholder","What's on your mind?"),
        $("<button type='button'>").html("Tweet about this page").attr("id","sendTweet").attr("class","btn btn-default pull-right")
        .click(function(){
              sendTweet();
              return true;
          })
        )

      )
   
  );
  var renderTweets = null;
  var tweets = null;
  var in_reply_to_status_id = null;


  
  var logOut = function(){
    alert("You are now logged out.")
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    console.log(login);
    $(elm).html(login)
    $(login).addClass('show').removeClass('hide');
    window.location.reload();    
  }

  var sendTweet = function(){
    $(loading).addClass('show').removeClass('hide');
    delete message['count'];
    message.method = "POST";
    message.action = "https://api.twitter.com/1.1/statuses/update.json";
    message.oauth_token = accessToken
    message.parameters['status'] = ($(tweetInput).find("textarea").val() +" " +url)
    if(in_reply_to_status_id)
      message.parameters['in_reply_to_status_id'] = in_reply_to_status_id;
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      "consumerSecret": CONSUMER_SECRET,
      "tokenSecret": accessTokenSecret
    });

    $.ajax({
      type: "POST",
      url: OAuth.addToURL(message.action, message.parameters),
      //data: {status : encodeURIComponent($(tweetInput).find("textarea").val() +" " +url).replace(/'/g,"%27").replace(/"/g,"%22") },
      success: function(data){
        //alert(JSON.stringify(data));
        tweets.unshift(data);
        renderTweets();
        $(tweetInput).find("textarea").val("");
        $(loading).addClass('hide').removeClass('show');
      },
      error: function(xhr, status, error) {
        //alert(JSON.stringify(xhr));
        //alert(JSON.stringify(message));
        //alert(JSON.stringify(error));
        //alert(OAuth.addToURL(message.action, message.parameters));
        //alert(encodeURIComponent($(tweetInput).find("textarea").val() +" " + url).replace(/'/g,"%27").replace(/"/g,"%22"));

        if (xhr.status === 401) {
          alert("Your session expired. Please relogin.")
          localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          window.location.reload();
        }
      },
      dataType: "json"
    });
    return true;
  };


  var follow = function(userId,followElement,username,alreadyFollowing){
    $(loading).addClass('show').removeClass('hide');
    message.method = "POST";
    if(alreadyFollowing)
      message.action = "https://api.twitter.com/1.1/friendships/destroy.json";
    else
      message.action = "https://api.twitter.com/1.1/friendships/create.json";
    message.oauth_token = accessToken;
    message.parameters['user_id'] = userId;
    if(!alreadyFollowing)
      message.parameters['follow'] = true;    

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      "consumerSecret": CONSUMER_SECRET,
      "tokenSecret": accessTokenSecret
    });


    $.ajax({
      type: "POST",
      url: OAuth.addToURL(message.action, message.parameters),
      //data: {status : encodeURIComponent($(tweetInput).find("textarea").val() +" " +url).replace(/'/g,"%27").replace(/"/g,"%22") },
      success: function(data){
        //alert(JSON.stringify(data));
        $(loading).addClass('hide').removeClass('show');
        if(!alreadyFollowing)
          $(followElement).attr('following','true').text("Unfollow @"+username);
        else
          $(followElement).attr('following','false').text("Follow @"+username);

      },
      error: function(xhr, status, error) {
        //alert(JSON.stringify(xhr));
        //alert(JSON.stringify(message));
        //alert(JSON.stringify(error));
        //alert(OAuth.addToURL(message.action, message.parameters));
        
        if (xhr.status === 401) {
          alert("Your session expired. Please relogin.")
          localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          window.location.reload();
        }
      },
      dataType: "json"
    });

  };

  var reTweet = function(id,TheElement){
    $(loading).addClass('show').removeClass('hide');
    message.method = "POST";
    message.action = "https://api.twitter.com/1.1/statuses/retweet/"+id+".json";
    message.oauth_token = accessToken;

    

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      "consumerSecret": CONSUMER_SECRET,
      "tokenSecret": accessTokenSecret
    });

    $.ajax({
      type: "POST",
      url: OAuth.addToURL(message.action, message.parameters),
      //data: {status : encodeURIComponent($(tweetInput).find("textarea").val() +" " +url).replace(/'/g,"%27").replace(/"/g,"%22") },
      success: function(data){
        //alert(JSON.stringify(data));
        $(TheElement).addClass('retweeted');
        $(loading).addClass('hide').removeClass('show');

      },
      error: function(xhr, status, error) {
        //alert(JSON.stringify(xhr));
        //alert(JSON.stringify(message));
        //alert(JSON.stringify(error));
        //alert(OAuth.addToURL(message.action, message.parameters));
        //alert(encodeURIComponent($(tweetInput).find("textarea").val() +" " + url).replace(/'/g,"%27").replace(/"/g,"%22"));

        if (xhr.status === 401) {
          alert("Your session expired. Please relogin.")
          localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          window.location.reload();
        }
      },
      dataType: "json"
    });
  };
  
  var favIt = function(id,TheElement){
    $(loading).addClass('show').removeClass('hide');
    message.method = "POST";
    message.action = "https://api.twitter.com/1.1/favorites/create.json";
    message.oauth_token = accessToken;

    delete message.parameters;

    message.parameters = {
      "oauth_consumer_key": CONSUMER_KEY,
      "oauth_signature_method": "HMAC-SHA1",
      "oauth_token": accessToken,
      "id" : id 
    }

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, {
      "consumerSecret": CONSUMER_SECRET,
      "tokenSecret": accessTokenSecret
    });

    $.ajax({
      type: "POST",
      url: OAuth.addToURL(message.action, message.parameters),
      //data: {status : encodeURIComponent($(tweetInput).find("textarea").val() +" " +url).replace(/'/g,"%27").replace(/"/g,"%22") },
      success: function(data){
        //alert(JSON.stringify(data));
        $(TheElement).addClass('retweeted');
        $(loading).addClass('hide').removeClass('show');

      },
      error: function(xhr, status, error) {
        alert(JSON.stringify(xhr));
        //alert(JSON.stringify(message));
        //alert(JSON.stringify(error));
        //alert(OAuth.addToURL(message.action, message.parameters));
        //alert(encodeURIComponent($(tweetInput).find("textarea").val() +" " + url).replace(/'/g,"%27").replace(/"/g,"%22"));

        if (xhr.status === 401) {
          alert("Your session expired. Please relogin.")
          localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          window.location.reload();
        }
      },
      dataType: "json"
    });
  };

  
  

  $.ajax({
    "type": "GET",
    "url": OAuth.addToURL(message.action, message.parameters),
    "dataType": "json",
    "success": function(data) {
      $(loading).addClass('hide');
      tweets = data.statuses;
      var root = $("<div>").attr("id", "tweets").attr("class", "col-xs-12");

      //$("#sendTweet");



      renderTweets = function(){
        tweets.forEach(function(tweet) {
          var retweeted = false;

          if (_.has(tweet, "retweeted_status")) {
            var entities = tweet.entities;
            var retweetUser = tweet.user;

            tweet = tweet.retweeted_status;
            tweet.entities = entities;
            tweet.retweet_user = retweetUser;

            retweeted = true;
          }

          var user = tweet.user;
          var source = $(tweet.source);
          
          if (_.isObject(source) && _.isElement(source[0])) {
            source.attr("target", "_blank");
          } else {
            source = $("<a>").attr("href", "javascript:void(0)").text(tweet.source);
          }

          $(source).attr(
                        "class",
                        "time-information"
                      );
          $(source).html( "Tweeted through "+$(source).html() );

          var replyBack = $("<a>").attr({"href":"javascript:void(0)","id":"reply"+tweet.id_str, "data-original-title":"Reply"}).prepend(
              $('<i>').attr("class","fa fa-reply")
            );

          var retweet =  $("<a>").attr({"href":"javascript:void(0)","id":"retweet"+tweet.id_str,"data-original-title":"Retweet"}).prepend(
              $('<i>').attr("class","fa fa-retweet")
            );


          

          if(retweeted)
            $(retweet).attr('class','retweeted');

          var like =  $("<a>").attr({"href":"javascript:void(0)","id":"like"+tweet.id_str,"data-original-title":"Like"}).prepend(
              $('<i>').attr("class","fa fa-star")
            );


          $(replyBack).tooltip();
          $(retweet).tooltip();
          $(like).tooltip();


          $(replyBack).click(function(){
            in_reply_to_status_id = tweet.id_str;
            $(tweetInput).find("textarea").val("@"+user.screen_name);
          });

          
          $(retweet).click(function(){
            //if(retweeted)
              reTweet(tweet.id_str,retweet);
            // else
            //   undoReTweet(tweet.id_str,retweet);
          });

          
          $(like).click(function(){
            favIt(tweet.id_str,like);
          });

          

          var row = $("<div>").attr("class", "rows");
          var tweetTime = $("<a>").attr(
                        "href",
                        "https://twitter.com/" + user.screen_name + "/status/" + tweet.id_str
                      ).attr(
                        "target",
                        "_blank"
                      )
                      .attr(
                        "class",
                        "time-information"
                      )
                      .attr(
                        "title",
                        new Date(tweet.created_at)
                      ).text(normalizeDateTime(new Date(tweet.created_at)));

          var followButton = $("<button>").attr("class","btn btn-primary btn-xs").attr('following','false').text("Follow @" + user.screen_name);
          if(user.following)
            $(followButton).attr('following','true').text("Unfollow @" + user.screen_name);
          var tweetInfo = 
                $("<div>").attr("class", "tweet-info clearfix").append(
                  $("<div>").attr("class", "row").append(
                    $("<div>").attr("class", "col-xs-8").append(
                      followButton
                    ),
                    $("<div>").attr("class", "col-xs-4").append(
                      $("<ul>").attr("class","list-inline pull-right").append(
                        $("<li>").append(replyBack),
                        $("<li>").append(retweet),
                        $("<li>").append(like)
                      )
                    )
                  )
                  
                );
                //source,


          $(followButton).click(function(){
            if( JSON.parse( $(followButton).attr('following') ) )
              follow(user.id,followButton,user.screen_name,true);
            else
              follow(user.id,followButton,user.screen_name,false);
          });
          
          var media = $("<div>").attr("class", "medias");
          if(tweet.entities.media && tweet.entities.media.length){
            var mElements = tweet.entities.media[0];

            $(media).append(
              $("<img>").attr("src",mElements.media_url)
              );
          };
          

          row.append(

            $("<div>").attr("class", "tweet-icon col-xs-2").append(
              $("<img>").attr("src", user.profile_image_url_https).attr("class","img-rounded")
            ),


            $("<div>").attr("class", "tweet-detail col-xs-10").prepend(


              $("<div>").attr("class", "row").prepend(

                $("<div>").attr("class", "col-xs-6").prepend(


                  //username
                  $("<a>").attr(
                      "href",
                      "http://twitter.com/" + user.screen_name
                    ).attr("target", "_blank").attr("class", "username").text(user.name)
                      
                  ),
                
                $("<div>").attr("class", "col-xs-6").prepend(
                      $("<div>").attr("class","pull-right").append(
                        $("<p>").attr("class","").append(tweetTime)
                      )
                  )
                

                ),

              $("<div>").attr("class", "row").prepend(

                $("<div>").attr("class", "col-xs-12").prepend(
                  //
                  //tweet.entities.media
                  $("<div>").attr("class","border").html((normalizeTweetText(tweet))),
                  media,
                  tweetInfo,
                  source
                      
                  )
                

                )

                
            )

          )
          var tweetView = $("<div>").attr("class", "tweet border").append(
            row);


          

          //tweetInfo.append(source);

          // if (retweeted) {
          //   tweetInfo.append(
          //     $("<div>").attr("class", "retweet-info").append(
          //       $("<span>").append(
          //         $("<i>").attr("class", "retweet-icon")
          //       ),
          //       $("<span>").css("color", "#336699").text("Retweeted by " + tweet.retweet_user.name)
          //     )
          //   );
          // }

          tweetView.append($("<div>").attr("class", "clearfix"));

          
          root.append(tweetView);
          $(loading).addClass('hide').removeClass('show');
          //root.append(debug);

        });
      };


      renderTweets();
        

      //elm.removeChild(elm.querySelector("#twitter-login"));
      $(elm).html(root);
      
      $(elm).prepend(
        
        $("<div>").attr("id","header").attr("class","col-xs-12 border")
        .prepend(
          $("<h5>").attr("class","col-xs-12").html("<b class='bold-heading'>Tweets</b> for <i>" + url)
          )

        .append(
          $("<button type='button'>").html("LogOut").attr("id","sendTweet").attr("class","btn btn-default pull-right")
        .click(function(){
              logOut();
              return true;
          })
        )


        );

      $(inputButton).html(tweetInput);
    },
    "error": function(xhr, status, error) {
      //alert(JSON.stringify(xhr));
      //alert(JSON.stringify(status));
      //alert(JSON.stringify(error));
      //alert(OAuth.addToURL(message.action, message.parameters));

      if (xhr.status === 401) {
        alert("Your session expired. Please relogin.")
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        window.location.reload();
      }
    }
  });
};



function normalizeTweetText(tweet) {
  if (_.isObject(tweet)) {
    var text = tweet.text;
    var entities = tweet.entities;

    if (_.isArray(entities.hashtags)) {
      entities.hashtags.forEach(function(hashtag) {
        text = text.replace(
          '#' + hashtag.text,
          '<a href="http://twitter.com/search/' + encodeURIComponent('#' + hashtag.text) + '" target="_blank">#' + hashtag.text + '</a>'
        );
      });
    }

    if (_.isArray(entities.media)) {
      entities.media.forEach(function(media) {
        text = text.replace(
          media.url,
          '<a href="' + media.media_url_https + '" target="_blank">' + media.url + '</a>'
        );
      });
    }

    if (_.isArray(entities.urls) > 0) {
      entities.urls.forEach(function(url) {
        text = text.replace(
          url.url,
          '<a href="' + url.expanded_url + '" target="_blank">' + url.expanded_url + '</a>'
        );
      });
    }

    if (_.isArray(entities.user_mentions)) {
      entities.user_mentions.forEach(function(mention) {
        text = text.replace(
          '@' + mention.screen_name,
          '<a href="https://twitter.com/' + mention.screen_name + '" target="_blank">@' + mention.screen_name + '</a>'
        );
      });
    }

    return text;
  } else {
    throw new Error("argument isn`t prototype of String");
  }
}

function normalizeDateTime(date) {

Date.prototype.getMonthName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names[this.getMonth()];
};

Date.prototype.getMonthNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names_short[this.getMonth()];
};

Date.locale = {
    en: {
       month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
       month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
};
  if (_.isDate(date)) {
    return date.getDate() + " " + date.getMonthNameShort();
    //return date.getFullYear() + "/" + zeroPadding(date.getMonth() + 1) + "/" + zeroPadding(date.getDate()) + " " + zeroPadding(date.getHours()) + ":" + zeroPadding(date.getMinutes()) + ":" + zeroPadding(date.getSeconds());
  } else {
    throw new Error("argument isn`t prototype of Date");
  }
}

function zeroPadding(n) {
  if (_.isNumber(n)) {
    if (String(n).length == 1) {
      return "0" + n;
    }
  }

  return n;
}