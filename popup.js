//window.location.reload();
var popup = function(undefined) {
  //var bgPage = chrome.extension.getBackgroundPage();

  var networks = new Networks();


  var facebookLoginButton = document.querySelector("#fb-login");

  facebookLoginButton.addEventListener("click", function() {
    $("#fb_loading").addClass('show').removeClass('hide');
    $("#fb_loading > #loadingInformation").html("Redirecting you to facebook autentication");
    networks.fbLogin();
  });

  var twitterLoginButton = document.querySelector("#twitter-login");
  twitterLoginButton.addEventListener("click", function() {
    $("#loading").addClass('show').removeClass('hide');
    $("#loading > #loadingInformation").html("Redirecting you to twitter autentication");
    networks.login();
  });


  $("#loading").addClass('hide').removeClass('show');


  function handleMessage(msgEvent) {

    if(msgEvent.name=='fb_access'){
      var token = msgEvent.message;
      if(token){
        localStorage.setItem('fbToken',token);
        alert("You are now logged into TTAGIT using facbook, you may close this tab.");
        popup();
      }

    }
      if (msgEvent.name == 'pin') {
        networks.sign(msgEvent.message, function(success){
          if(success)
            alert("You are now logged into TTAGIT, you may close this tab.");
        });
          
      }

      // if(msgEvent.name == 'url' && networks.isAuthenticated()) {
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
      //body();
      var root = document.querySelector("#content");
        
      var input = document.querySelector("#input");

      var loading = document.querySelector("#loading");
      var login = document.getElementsByTagName("twitterLogin")
      
      networks.fetchTwitter(root,input,loading,login,safari.application.activeBrowserWindow.activeTab.url);
  }

  

  //safari.application.addEventListener("open", handleOpen, true);
  var popcall = function(){
    if (networks.isTwitterAuthenticated()) {
        if(safari.application.activeBrowserWindow.activeTab.url){
          handleOpen();
        }

    } else {
      $("#welcome").addClass('show').removeClass('hide');
      twitterLoginButton.style.display = "block";
    }

    var fbLoginFormElement = document.querySelector("#facebook-login");

    if (networks.isFacebookAuthenticated()) {
        fbLoginFormElement.style.display = "none";
        var fb_root = document.querySelector("#fb_content");
      
        var fb_input = document.querySelector("#fb_input");

        var fb_loading = document.querySelector("#fb_loading");
        networks.fetchFacebook(fb_root,fb_input,fb_loading,safari.application.activeBrowserWindow.activeTab.url);
    }



  }

  safari.application.addEventListener("popover", popcall, true);
  safari.application.addEventListener("activate", activeTabHandler, true);
  function activeTabHandler(event) {
    //console.log(safari.application.activeBrowserWindow.activeTab);
    //safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('someId', false);
  }  
};

popup();


if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = popup;
  }
  exports.popup = popup;
} else {
  //root['popup'] = popup;
}