var api = null;

function getTwitterAPI() {
  if (api === null) {
    api = new Twitter();
  }

  return api;
}

chrome.extension.onRequest.addListener(function(req, sender, res) {
	if(req.newTab){
		//chrome.tabs.remove(sender.tab.id);
		//chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')}, function(tab) {
		//});
  	}
  	else
  		getTwitterAPI().sign(req.verifier, res);

});
