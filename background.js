const CONSUMER_KEY = "5Xq8DNluLF0rZ4zXaTkBgaMG1";
const CONSUMER_SECRET = "mdaOi4eFw3jUXmWTbX2oyBbpiXZ74sHuufrgoKEB1nIJ03AcGG";
const ACCESS_TOKEN_STORAGE_KEY = "ttagitStorage";
const ACCESS_TOKEN_SECRET_STORAGE_KEY = "67ityughjgtyugjhgtye5467";


jQuery(document).ready(function(){
//var pinElement = document.querySelector("div#oauth_pin > p > kbd > code");

var pinElement = (jQuery("div#oauth_pin").find("code").text());

if (pinElement !== null && window.location.href.match(/api.twitter.com([^&]+)/) && document.referrer.match(/oauth_consumer_key=([^&]+)/)) {


	//regex for integer
	var intRegex = /^\d+$/;
	var pin = 0;

  if (RegExp.$1 === CONSUMER_KEY) {
  	if( intRegex.test(parseInt(pinElement) ) ) {
  		pin = parseInt(pinElement);
  	}
  	else
    	pin = prompt("Enter the PIN displayed by Twitter");


    safari.self.tab.dispatchMessage('pin', pin);

  }
}

// else{

// 	safari.self.tab.dispatchMessage('url',window.location.href);
// }

});