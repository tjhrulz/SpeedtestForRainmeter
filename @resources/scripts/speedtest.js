var page = require("webpage").create();
var fs = require('fs');
var outputCount = 0;
address = "https://www.google.com/search?q=speedtest";
lastUpload = "0";

//page.viewportSize = {
//  width: 480,
//  height: 800
//};
page.settings.userAgent = "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36";
page.open(address, function(status) {
	if (status !== "success") {
		fs.write("output.txt", "Check internet connection\n", 'w');
		fs.write("output.txt", "P:" + "-1" + " D:" + "-1" + " U:" + "-1\n", 'a');
		phantom.exit();
	}
	else {

		runSpeedtest();
	}
});


function runSpeedtest() {
	clickStart();
	updater = setInterval(updateSpeedtestData, 150);
}

function clickStart() {
	fs.write("output.txt", "", 'w');
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

  //writeCurrPageToFile();

	if (info.length > 3 && info[3] === "Testing download..." && info[0] !== "┬á") {
		fs.write("output.txt", "D: " + (Math.round(info[1] * 100) / 100).toFixed(2) + " " + info[2] + "\n", 'a');
	}
	else if (info.length > 3 && info[3] === "Testing upload..." && info[0] !== "┬á") {

    if(lastUpload == "0")
    {
      lastUpload = info[1];
    }
    else {
		    fs.write("output.txt", "U: " + (Math.round(lastUpload) / 100).toFixed(2) + " " + info[2] + "\n", 'a');
        lastUpload = info[1];
    }


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

	fs.write("output.txt", "P:" + ping + " D:" + download + " U:" + upload + "\n", 'a');
	phantom.exit();
}

function writeCurrPageToFile()
{
  fs.write(outputCount + "output.html", page.evaluate( function(){ return document.body.innerHTML; }), 'w');
  outputCount++;
}
