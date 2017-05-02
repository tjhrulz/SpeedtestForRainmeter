var page = require("webpage").create();
var fs = require('fs');
var outputCount = 0;
address = "https://www.google.com/search?q=speedtest";

page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36";
page.open(address, function(status) {
	if (status !== "success") {
		console.log("Check internet connection");
	}
	else {
		//console.log("Starting google search speedtest");

		runSpeedtest();
	}
});


function runSpeedtest() {
	//console.log("Running google search speedtest");
	clickStart();
	updater = setInterval(updateSpeedtestData, 150);
}

function clickStart() {
	page.evaluate(function() {
		var a = document.getElementById("lrfactory-internetspeed__test_button");
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	});
}

function updateSpeedtestData() {
	var info = page.evaluate(function() {
		return document.getElementsByClassName("lrfactory-internetspeed__status-indicator")[0].innerText.split("\n");
	});

  //console.log(info);

	if (info.length > 3 && info[3] === "Testing download...") {
		console.log("D: " + info[1] + " " + info[2]);
	}
	else if (info.length > 3 && info[3] === "Testing upload...") {
		console.log("U: " + info[1] + " " + info[2]);
    writeCurrPageToFile();
		var possibleFinalData = page.evaluate(function() {
			return document.getElementById("lrfactory-internetspeed__upload").innerText.split("\n")[0];
		});
		if (possibleFinalData !== " ") {
			clearInterval(updater);
			finalSpeedtestData();
		}
	}
}

function finalSpeedtestData() {
  var ping = page.evaluate(function() {
    return document.getElementById("lrfactory-internetspeed__latency").innerText.replace("Latency: ", "");
  });
	var download = page.evaluate(function() {
		return document.getElementById("lrfactory-internetspeed__download").innerText.replace(/\n/gi, "").replace(" download", "");
	});
	var upload = page.evaluate(function() {
		return document.getElementById("lrfactory-internetspeed__upload").innerText.replace(/\n/gi, "").replace(" upload", "");
	});
  
	console.log("P:" + ping + " D:" + download + " U:" + upload);
	phantom.exit();
}

function writeCurrPageToFile()
{
  fs.write(outputCount + "output.html", page.evaluate( function(){ return document.body.innerHTML; }), 'w');
  outputCount++;
}
