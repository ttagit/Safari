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
    console.log(msgEvent);
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
    if (networks.isAuthenticated()) {
        if(safari.application.activeBrowserWindow.activeTab.url){
          handleOpen();
        }

    } else {
      $("#welcome").addClass('show').removeClass('hide');
      twitterLoginButton.style.display = "block";
    }

    var fbLoginFormElement = document.querySelector("#facebook-login");
    if (localStorage.fbToken) {
        fbLoginFormElement.style.display = "none";
        var fb_root = document.querySelector("#fb_content");
      
        var fb_input = document.querySelector("#fb_input");

        var fb_loading = document.querySelector("#fb_loading");
        network.fetchFacebook(fb_root,fb_input,fb_loading,safari.application.activeBrowserWindow.activeTab.url);
    }




  var  b_loading = document.querySelector("#b_loading")
      ,b_content = document.querySelector("#b_content");

  
    $("#b_loading").addClass('show').removeClass('hide');
    networks.showSentiments(b_content,b_loading,safari.application.activeBrowserWindow.activeTab.url,function(entitiesData,conceptsData){
        
        var dataSet = [];
        _.each(entitiesData,function(d,i){
          
          if(d.text && dataSet.length<11){
            dataSet.push({label:d.text,data:d.relevance,

              color: Please.make_color({
                      golden: false})
          })
          }
          
        })

        var ConceptsdataSet = [];
        _.each(conceptsData,function(d,i){
          
          if(d.text && ConceptsdataSet.length<11){
            ConceptsdataSet.push({label:d.text,data:d.relevance,

              color: Please.make_color({
                      golden: false})
          })
          }
          
        })

        var options = {
          series: {
            pie: {
                show: true,                
                radius: 500,
                label: {
                    show:true,
                    radius: 0.8,
                    formatter: function (label, series) {                
                        return '<div style="border:1px solid grey;font-size:8pt;text-align:center;padding:5px;color:white;">' +
                        label + ' : ' +
                        Math.round(series.percent) +
                        '%</div>';
                    },
                    background: {
                        opacity: 0.8,
                        color: '#000'
                    }
                }
            }
        },
        legend: {
            show: false
        }
      }
      
      $("#canvas").attr({"style":"height:400px;width:520px;"});
      $("#canvas_concepts").attr({"style":"height:400px;width:500px;"});

      $(".tagged").removeClass('hide').addClass('show');

      $.plot($("#canvas"), dataSet, options);
      $.plot($("#canvas_concepts"), ConceptsdataSet, {
          series: {
            pie: {
                show: true,    
                radius:200,
                innerRadius: 0.5,
                label: {
                    show:true,
                    formatter: function (label, series) {                
                        return '<div style="border:1px solid grey;font-size:9pt;text-align:center;padding:5px;color:white;">' +
                        label + ' : ' +
                        Math.round(series.percent) +
                        '%</div>';
                    },
                    background: {
                        opacity: 0.8,
                        color: '#000'
                    }
                }
            }
        },
        legend: {
            show: false
        }
      });

    });




  }

  safari.application.addEventListener("popover", popcall, true);
  safari.application.addEventListener("activate", activeTabHandler, true);
  function activeTabHandler(event) {
    console.log(safari.application.activeBrowserWindow.activeTab);
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
  root['popup'] = popup;
}