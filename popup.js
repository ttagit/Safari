//window.location.reload();
var popup = function(undefined) {
  //var bgPage = chrome.extension.getBackgroundPage();

  var twitter = new Networks();

  var loginFormElement = document.querySelector("#twitter-login");
  loginFormElement.addEventListener("click", function() {
    $("#loading").addClass('show').removeClass('hide');
    $("#loading > #loadingInformation").html("Redirecting you to twitter autentication");
    twitter.login();
  });


  $("#loading").addClass('hide').removeClass('show');


  function handleMessage(msgEvent) {
    console.log(msgEvent);
      if (msgEvent.name == 'pin') {
        twitter.sign(msgEvent.message, function(success){
          if(success)
            alert("You are now logged into TTAGIT, you may close this tab.");
        });
          
      }

      // if(msgEvent.name == 'url' && twitter.isAuthenticated()) {
      //   $("#loading").addClass('show').removeClass('hide');

      //   
      // }
  }
  function body(){
    $("body").html('<div class="row"><div id="loading" class="col-xs-7"><p class="loadingInformation"></p><img src="ajax-loader.gif"></div></div><div id="input"></div><div id="content" class="row"></div>');
  }
  safari.application.addEventListener('message', handleMessage, false);
  //window.addEventListener('focus', handleMessage, true);
  //safari.application.addEventListener("command", handleOpen, false);

  function handleOpen(e) {
      body();
      var root = document.querySelector("#content");
        
      var input = document.querySelector("#input");

      var loading = document.querySelector("#loading");
      var login = document.getElementsByTagName("twitterLogin")
      console.log(login)
      twitter.fetchTwitter(root,input,loading,login,safari.application.activeBrowserWindow.activeTab.url);
  }

  

  //safari.application.addEventListener("open", handleOpen, true);
  var popcall = function(){
    if (twitter.isAuthenticated()) {
        if(safari.application.activeBrowserWindow.activeTab.url){
          handleOpen();
        }

    } else {
      $("#welcome").addClass('show').removeClass('hide');
      loginFormElement.style.display = "block";
    }
  }

  safari.application.addEventListener("popover", popcall, true);
    

};

popup();


if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = popup;
  }
  exports.popup = popup;
} else {
  root['popup'] = popup;
}