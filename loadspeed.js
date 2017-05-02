var page = require("webpage").create();
system = require("system");

if (system.args.length === 1) {
    console.log("Usage: loadspeed.js fast|speedtest|google");
    phantom.exit(1);
} else {
    var whichAddress = system.args[1];

	if(whichAddress.indexOf("fast") !== -1)
	{
		address = "https://fast.com/";		
	}
	else if(whichAddress.indexOf("speedtest") !== -1)
	{
		address = "http://beta.speedtest.net/";		
	}
	else if(whichAddress.indexOf("google") !== -1)
	{
		address = "https://www.google.com/search?q=speedtest&oq=speedtest";
		//address = "http://speedtest.googlefiber.net/";		
	}
	else
	{
		console.log("Address given no recognized, using fast.com");	
		address = "https://fast.com/";	
	}
	console.log("Using address:" + address);	
	
	page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36";
	page.open(address, function (status) 
	{
		if (status !== "success") 
		{
			console.log("FAIL to load the address");
		} 
		else 
		{
			setTimeout(function(){
				setTimeout(function(){
					if(whichAddress.indexOf("fast") !== -1)
					{
						console.log("Starting fast.com speedtest");
						setTimeout(function(){
							var download = page.evaluate(function () {
								return document.getElementById("speed-value").innerHTML;
							});
							console.log("P:" + "" + " D:" + download + " U:" + "");
							
							phantom.exit();
						},10000);
					}
					else if(whichAddress.indexOf("speedtest") !== -1)
					{
						console.log("Starting beta.speedtest.net speedtest");
						console.log("Found button:" + page.evaluate(function() {
							return document.getElementsByClassName("start-text")[0].innerHTML;
						}));
						
						page.evaluate(function(){
							var a = document.getElementsByClassName("js-start-test start-button-measured")[0];
							var e = document.createEvent('MouseEvents');
							e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
							a.dispatchEvent(e);
							waitforload = true;
						});						
						
						setTimeout(function(){
							var ping = page.evaluate(function () {
								return document.getElementById("ping-value").innerHTML;
							});
							var download = page.evaluate(function () {
								return document.getElementsByClassName("result-data-large number result-data-value download-speed")[0].innerHTML;
							});
							var upload = page.evaluate(function () {
								return document.getElementsByClassName("result-data-large number result-data-value upload-speed")[0].innerHTML;
							});
							console.log("P:" + ping + " D:" + download + " U:" + upload);
							
							//console.log('Page body is ' + page.evaluate(function () {
							//	return document.body.innerHTML;
							//}));							
							
							console.log("Found button:" + page.evaluate(function() {
								return document.getElementsByClassName("start-text")[0].innerHTML;
							}));
							phantom.exit();
						},60000);
					}
					else if(whichAddress.indexOf("google") !== -1)
					{
						console.log("Starting google search speedtest");
						
						page.evaluate(function(){
							var a = document.getElementById("lrfactory-internetspeed__test_button");
							var e = document.createEvent('MouseEvents');
							e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
							a.dispatchEvent(e);
							waitforload = true;
						});
						
						setTimeout(function(){
							var download = page.evaluate(function () {
								return document.getElementsByClassName("_ylk iI6lIEYZcPmM-kMKCIXyuNCs")[0].innerHTML;
							});
							var upload = page.evaluate(function () {
								return document.getElementsByClassName("_ylk iI6lIEYZcPmM-Ehhee1Gox1M")[0].innerHTML;
							});
							console.log("P:" + "" + " D:" + download + " U:" + upload);

							phantom.exit();
						},60000);
					}
					else
					{
						console.log("Page unknown");
						phantom.exit();
					}
				},100);
			},1);
		}
	});
}