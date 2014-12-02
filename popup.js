
(function(undefined) {
  //var bgPage = chrome.extension.getBackgroundPage();

  var twitter = new Twitter();

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
          //safari.self.tab.dispatchMessage('pinverified', success);
          if(success)
            alert("You are now logged into TTAGIT, you may close this tab.");
        });
          
      }

      if(msgEvent.name == 'url' && twitter.isAuthenticated()) {
        $("#loading").addClass('show').removeClass('hide');
        twitter.fetchTimelines(root,input,loading,msgEvent.message);
      }
  }

  safari.application.addEventListener('message', handleMessage, false);

  if (twitter.isAuthenticated()) {
    loginFormElement.style.display = "none";

    $("#welcome").addClass('hide').removeClass('show');
    
    var root = document.querySelector("#content");
    
    var input = document.querySelector("#input");

    var loading = document.querySelector("#loading");
    
    

    //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if(safari.application.activeBrowserWindow.activeTab.url)
        twitter.fetchTimelines(root,input,loading,safari.application.activeBrowserWindow.activeTab.url);

    //});

  } else {
    $("#welcome").addClass('show').removeClass('hide');
    loginFormElement.style.display = "block";
  }

})();
