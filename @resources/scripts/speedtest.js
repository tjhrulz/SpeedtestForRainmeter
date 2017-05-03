var page = require("webpage").create();
var fs = require('fs');
var system = require('system');

if (system.args.length > 1) {
	address = system.args[1].toLowerCase();

	if (address == "auto" || address == "automatic") {
		address = "https://www.google.com/search?q=speedtest";
	}
	else if (address == "google") {
		address = "https://www.google.com/search?q=speedtest";
	}
	else if (address == "netflix" || address == "fast") {
		address = "https://fast.com/";
	}
	else if (address == "speedof" || address == "speedofme") {

		console.log("Speedof blocks phantomjs, switching to google");
		address = "https://www.google.com/search?q=speedtest";
		//address = "http://speedof.me/";
	}
	else if (address.substring(0, 8) !== "https://" && address.substring(0, 7) !== "http://") {
		address = "http://" + address;
	}

}
else {
	address = "https://www.google.com/search?q=speedtest";
}

console.log(address);
var outputCount = 0;

page.viewportSize = {
  width: 480,
  height: 800
};
page.settings.userAgent = "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36";

page.open(address, function(status) {
	console.log(status);

	if (status !== "success") {
		fs.write("output.txt", "Check internet connection to " + address + "\n", 'w');
		fs.write("output.txt", "P:" + "-1" + " D:" + "-1" + " U:" + "-1\n", 'a');
		phantom.exit();
	}
	else {

		if (address == "https://www.google.com/search?q=speedtest") {

			//Google will fallback to fast if in an unsupported country, will in the future fallback to speedof
			runSpeedtestGoogle();
		}
		else if (address == "https://fast.com/") {
			runSpeedtestFast();
		}
		else if (address == "http://speedof.me/") {
			runSpeedtestSpeedof();
		}
		else {
			fs.write("output.txt", "Unsupported speedtest website " + address + "\n", 'w');
			fs.write("output.txt", "P:" + "-1" + " D:" + "-1" + " U:" + "-1\n", 'a');
		}
	}
});

/*
 ██████   ██████   ██████   ██████  ██      ███████
██       ██    ██ ██    ██ ██       ██      ██
██   ███ ██    ██ ██    ██ ██   ███ ██      █████
██    ██ ██    ██ ██    ██ ██    ██ ██      ██
 ██████   ██████   ██████   ██████  ███████ ███████
*/

function runSpeedtestGoogle() {

	if (page.evaluate(function() {
			return document.getElementById("lrfactory-internetspeed__upload");
		})) {
		console.log("Google");


		lastUpload = "0";
		fs.write("output.txt", "", 'w');
		page.evaluate(function() {
			var a = document.getElementById("lrfactory-internetspeed__test_button");
			var e = document.createEvent('MouseEvents');
			e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(e);
		});

		updater = setInterval(updateSpeedtestDataGoogle, 150);
	}
	else {
		console.log("Fast");

		//Run in 100ms so that way the connection to google has time to close
		setTimeout(runSpeedtestFast, 100);
	}
}

function updateSpeedtestDataGoogle() {
	var info = page.evaluate(function() {
		return document.getElementsByClassName("lrfactory-internetspeed__status-indicator")[0].innerText.split("\n");
	});

	//writeCurrPageToFile();

	if (info.length > 3 && info[3] === "Testing download..." && info[0] !== "┬á") {
		fs.write("output.txt", "D: " + (Math.round(info[1] * 100) / 100).toFixed(2) + " " + info[2] + "\n", 'a');
	}
	else if (info.length > 3 && info[3] === "Testing upload..." && info[0] !== "┬á") {

		if (lastUpload == "0") {
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
			finalSpeedtestDataGoogle();
		}
	}
}

function finalSpeedtestDataGoogle() {
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

/*
███████  █████  ███████ ████████
██      ██   ██ ██         ██
█████   ███████ ███████    ██
██      ██   ██      ██    ██
██      ██   ██ ███████    ██
*/

function switchToFast() {
	address = "https://fast.com/";
	page.open(address, function(status) {
		if (status !== "success") {
			fs.write("output.txt", "Check internet connection to https://fast.com/\n", 'w');
			fs.write("output.txt", "P:" + "-1" + " D:" + "-1" + " U:" + "-1\n", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestFast();
		}
	});
}

function runSpeedtestFast() {
	fs.write("output.txt", "", 'w');
	updater = setInterval(updateSpeedtestDataFast, 150);
}

function updateSpeedtestDataFast() {
	var speed = page.evaluate(function() {
		return document.getElementById("speed-value").innerText;
	});
	var units = page.evaluate(function() {
		return document.getElementById("speed-units").innerText;
	});

	//writeCurrPageToFile();

	if (units == " ") {
		units = "none";
	}

	fs.write("output.txt", "D: " + (Math.round(speed * 100) / 100).toFixed(2) + " " + units + "\n", 'a');

	var buttonState = page.evaluate(function() {
		return document.getElementById("speed-progress-indicator-icon").classList[2];
	});

	if (buttonState == "oc-icon-refresh") {
		clearInterval(updater);
		fs.write("output.txt", "D: Done Done\n", 'a');
		finalSpeedtestDataFast();
	}

}

function finalSpeedtestDataFast() {
	phantom.exit();
}

/*
███████ ██████  ███████ ███████ ██████   ██████  ███████
██      ██   ██ ██      ██      ██   ██ ██    ██ ██
███████ ██████  █████   █████   ██   ██ ██    ██ █████
     ██ ██      ██      ██      ██   ██ ██    ██ ██
███████ ██      ███████ ███████ ██████   ██████  ██
*/

//**********************************************************************************
//DONT CALL THESE FUNCTIONS, SPEEDOF SEEMS TO SELL AND API AND THUS BLOCKS PHANTOMJS
//**********************************************************************************
function switchToSpeedof() {
	address = "http://speedof.me/";
	page.open(address, function(status) {
		if (status !== "success") {
			fs.write("output.txt", "Check internet connection to http://speedof.me/\n", 'w');
			fs.write("output.txt", "P:" + "-1" + " D:" + "-1" + " U:" + "-1\n", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestSpeedof();
		}
	});
}

function runSpeedtestSpeedof() {
	console.log("SpeedOf");

	fs.write("output.txt", "", 'w');
	page.evaluate(function() {
		var a = document.getElementById("btnStart");
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	});

	updater = setInterval(updateSpeedtestDataSpeedof, 150);
}

function updateSpeedtestDataSpeedof() {


	//Contains test in progress unless test it is done, then it contains final download
	var infoOrDownload = page.evaluate(function() {
		return document.getElementById("msgContainer1").innerText.Split(" ");
	});

	//Contains current size of the test unless it is done, then it contains final upload
	var stateAndsizeOrUpload = page.evaluate(function() {
		return document.getElementById("msgContainer2").innerText.Split(" ");
	});

	//Contains current speed of test unless it is done, then it contains Click share
	var speedOrClick = page.evaluate(function() {
		return document.getElementById("msgContainer3").innerText.Split(" ");
	});

	writeCurrPageToFile();


	//Location 0 is always info text, Location 1 is always speed, Location 2 is always units
	//If it is not a speed then Location 0 is always state and everything else doesn't matter
	if (stateAndsizeOrUpload[0] == "Downloading") {
		fs.write("output.txt", "D: " + (Math.round(speedOrClick[1] * 100) / 100).toFixed(2) + " " + speedOrClick[2] + "\n", 'a');
	}
	else if (stateAndsizeOrUpload[0] == "Uploading") {

		fs.write("output.txt", "U: " + (Math.round(speedOrClick[1] * 100) / 100).toFixed(2) + " " + speedOrClick[2] + "\n", 'a');
	}

	if (speedOrClick[0] == "Click") {
		clearInterval(updater);
		finalSpeedtestDataSpeedof(infoOrDownload[1], infoOrDownload[2], stateAndsizeOrUpload[1], stateAndsizeOrUpload[2]);
	}
}

function finalSpeedtestDataSpeedof(downloadSpeed, downloadSize, uploadSpeed, uploadSize) {

	fs.write("output.txt", "P:" + "-1" + " D:" + downloadSpeed + downloadSize + " U:" + uploadSpeed + uploadSize + "\n", 'a');
	phantom.exit();
}

function writeCurrPageToFile() {
	fs.write(outputCount + "output.html", page.evaluate(function() {
		return document.body.innerHTML;
	}), 'w');
	outputCount++;
}
