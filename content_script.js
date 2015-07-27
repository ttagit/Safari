jQuery(document).ready(function(){
//var pinElement = document.querySelector("div#oauth_pin > p > kbd > code");

var pinElement = (jQuery("div#oauth_pin").find("code").text());

if (pinElement !== null && document.referrer.match(/oauth_consumer_key=([^&]+)/)) {
	//regex for integer
	var intRegex = /^\d+$/;
	var pin = 0;

  if (RegExp.$1 === CONSUMER_KEY) {
  	if( intRegex.test(parseInt(pinElement) ) ) {
  		pin = parseInt(pinElement);
  	}
  	else
    	pin = prompt("Enter the PIN displayed by Twitter");

    chrome.extension.sendRequest({ "verifier": pin }, function(isSuccess) {
      if (isSuccess === true) {
        alert("Authorized, woot!");
    	chrome.extension.sendRequest({"newTab":true},function(isSuccess){
	    	if(isSuccess === true){
	    		
	    	}
	    });
    
    
      }
      else{
      	pin = prompt("Enter the PIN displayed by Twitter");
      	againVerify();
      }
    });

    var againVerify = function(){
    	chrome.extension.sendRequest({ "verifier": pin }, function(isSuccess) {
	      if (isSuccess === true) {
	        alert("Authorized, woot!");
	      }
	      else{
	      	alert("Cound not verify. Please try later.")
	      }
	    });
	    
    }

  }
}

});
