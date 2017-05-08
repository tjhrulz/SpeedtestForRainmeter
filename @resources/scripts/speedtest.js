var page = require("webpage").create();
var fs = require('fs');
var system = require('system');


//Copyright (C) 2017 Trevor Hamilton
//To anyone wanting to use this script for rainmeter speedtest skins you are freely allowed to do use and modify it without asking
//I would ask that you credit me for helping you and that you feel free to send any issues you have or help you need my way

//@Inputs: An argument of either the shorthand or the full speedtest site url
//Supported nicknames and full URL:
//Google https://www.google.com/search?q=speedtest
//Bandwidthplace http://www.bandwidthplace.com/
//Netflix or Fast https://fast.com/
//Speedtestbeta http://beta.speedtest.net/
//@Outputs: One output.txt formatted as follows, D and U row length is not fixed and the file is updated in real time
//Site: #SiteNickname#
//Supports: P D U F
//D: #Speed# #Units#
//D: #Speed# #Units#
//D: #Speed# #Units#
//U: #Speed# #Units#
//U: #Speed# #Units#
//U: #Speed# #Units#
//U: #Speed# #Units#
//F: P: #Ping# ms D: #Speed# #Units# U: #Speed# #Units#

//So a speedtest from fast.com could look like this
//Site: Fast
//Supports: D F
//D: 16.00 Kbps
//D: 16.00 Kbps
//D: 88.00 Kbps
//D: 280.00 Kbps
//D: 560.00 Kbps
//D: 560.00 Kbps
//D: 2.60 Mbps
//D: 2.60 Mbps
//D: 5.90 Mbps
//D: 9.90 Mbps
//D: 14.00 Mbps
//D: 21.00 Mbps
//D: 38.00 Mbps
//D: 59.00 Mbps
//D: 64.00 Mbps
//F: D: 60.00 Mbps


//@TODO Decide on a new fallback for Google that has the same feature set
//@TODO Fine tune refresh speeds per site
//Sites that are fine turned:
//@TODO Add fatal error catching (Possibly add timeout too?)
//@TODO Fix bandwidthplace sometimes getting ping stuck (Reset connection after so too long pinging (Note I have no way of knowing ping till it is done), maybe 5 seconds?)
//Note sometimes it seems like it is stuck but it is not since it seems they run multiple pings
//@TODO Sites to add support for:
//Verizon, beta.speedtest.net (Canvas extract)

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
	else if (address == "bandwidthplace" || address == "place" || address == "bandwidth") {
		address = "http://www.bandwidthplace.com/";
	}
	else if (address == "at&t" || address == "at" || address == "att" || address == "atandt") {
		console.log("at&t blocks phantomjs, switching to google");
		address = "https://www.google.com/search?q=speedtest";
		address = "http://speedtest.att.com/speedtest/";
	}
	else if (address == "verizon" || address == "fios") {
		address = "https://www.verizon.com/speedtest/";
	}
	else if (address == "comcast" || address == "xfinity") {
		console.log("Comcast (Fuck Comcast btw) blocks phantomjs, switching to google");
		address = "https://www.google.com/search?q=speedtest";
		//address = "http://speedtest.xfinity.com/";
	}
	else if (address == "speedtest" || address == "betaspeedtest" || address == "speedtestbeta") {
		console.log("speedtest.net only gives final output data and is unreliable and unimplemented, switching to google");
		address = "https://www.google.com/search?q=speedtest";
		//address = "http://beta.speedtest.net/";
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

//page.viewportSize = {
//	width: 480,
//	height: 800
//};
//page.settings.userAgent = "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36";

page.open(address, function(status) {
	console.log(status);

	if (status !== "success") {
		fs.write("output.txt", "Check internet connection to " + address + "\n", 'w');
		fs.write("output.txt", "F: P: " + "-1 error " + "D: " + "-1 error " + "U: " + "-1 error" + "\n", 'a');
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
		//else if (address == "http://speedof.me/") {
		//	runSpeedtestSpeedof();
		//}
		else if (address == "http://www.bandwidthplace.com/") {
			runSpeedtestBandwidthplace();
		}
		//else if (address == "http://beta.speedtest.net/") {
		//	runSpeedtestSpeedtestBeta();
		//}
		else if (address == "http://speedtest.att.com/speedtest/") {
			runSpeedtestATandT();
		}
		else if (address == "https://www.verizon.com/speedtest/") {
			runSpeedtestVerizon();
		}
		else if (address == "http://speedtest.xfinity.com/") {
			runSpeedtestComcast();
		}
		else {
			fs.write("output.txt", "Unsupported speedtest website " + address + "\n", 'w');
			fs.write("output.txt", "P: " + "-1 error" + " D:" + "-1 error" + " U:" + "-1 error", 'a');
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


		lastUpload = "0";
		lastUploadUnits = "";

		console.log("Google");
		fs.write("output.txt", "Site: Google\nSupports: P U D F\n", 'w');
		page.evaluate(function() {
			var a = document.getElementById("lrfactory-internetspeed__test_button");
			var e = document.createEvent('MouseEvents');
			e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(e);
		});

		updater = setInterval(updateSpeedtestDataGoogle, 150);
	}
	else {
		fs.write("output.txt", "Google speedtest unsupported in your country","w");
		phantom.exit();
		//console.log("Google speedtest unsupported in your contry, switching to fallback");
		//Run in 100ms so that way the connection to google has time to close
		//setTimeout(runSpeedtestFast, 100);
	}
}

function updateSpeedtestDataGoogle() {
	var info = page.evaluate(function() {
		return document.getElementsByClassName("lrfactory-internetspeed__status-indicator")[0].innerText.split("\n");
	});

	//writeCurrPageToFile();

	if (info.length > 3 && info[3] === "Testing download..." && info[0] !== "┬á" && info[1] !== " ") {
		fs.write("output.txt", "D: " + (Math.round(info[1] * 100) / 100).toFixed(2) + " " + info[2].replace("Megabits per second", "Mbps").replace("Gigabits per second", "Gbps").replace("Kilobits per second", "Kbps") + "\n", 'a');
	}
	else if (info.length > 3 && info[3] === "Testing upload..." && info[0] !== "┬á" && info[1] !== " ") {

		if (lastUpload == "0") {
			//Due to the issues with google giving me values 100 times as large for all but the last value the value displayed is one cycle old
			lastUpload = info[1];
			lastUploadUnits = info[2].replace("Megabits per second", "Mbps").replace("Gigabits per second", "Gbps").replace("Kilobits per second", "Kbps");
		}
		else {
			fs.write("output.txt", "U: " + (Math.round(lastUpload) / 100).toFixed(2) + " " + lastUploadUnits + "\n", 'a');
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
		return document.getElementById("lrfactory-internetspeed__download").innerText.replace(" download", "").split("\n");
	});
	var upload = page.evaluate(function() {
		return document.getElementById("lrfactory-internetspeed__upload").innerText.replace(" upload", "").split("\n");
	});

	//Loc[0] is speed Loc[1] is units
	fs.write("output.txt", "F: P: " + ping + " D: " + download[0] + " " + download[1] + " U: " + upload[0] + " " + upload[1] + "\n", 'a');
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
			fs.write("output.txt", "F: D: " + "-1 error ", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestFast();
		}
	});
}

function runSpeedtestFast() {
	console.log("Fast");
	fs.write("output.txt", "Site: Fast\nSupports: D F\n", 'w');

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

	if (units !== " ") {
		fs.write("output.txt", "D: " + (Math.round(speed * 100) / 100).toFixed(2) + " " + units + "\n", 'a');
	}

	var buttonState = page.evaluate(function() {
		return document.getElementById("speed-progress-indicator-icon").classList[2];
	});

	if (buttonState == "oc-icon-refresh") {
		clearInterval(updater);
		finalSpeedtestDataFast(speed, units);
	}

}

function finalSpeedtestDataFast(speed, units) {
	fs.write("output.txt", "F: D: " + (Math.round(speed * 100) / 100).toFixed(2) + " " + units + "\n", 'a');
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
//@TODO Find a way around speedof's phantomjs block

function switchToSpeedof() {
	address = "http://speedof.me/";
	page.open(address, function(status) {
		if (status !== "success") {
			fs.write("output.txt", "Check internet connection to http://speedof.me/\n", 'w');
			fs.write("output.txt", "F: P: " + "-1 error " + "D: " + "-1 error " + "U: " + "-1 error" + "\n", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestSpeedof();
		}
	});
}

function runSpeedtestSpeedof() {
	console.log("Speedof");
	fs.write("output.txt", "Site: Speedof\nSupports: P U D F\n", 'w');

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

	fs.write("output.txt", "P:" + "-1 error" + " D:" + downloadSpeed + downloadSize + " U:" + uploadSpeed + uploadSize + "\n", 'a');
	phantom.exit();
}

/*
██████   █████  ███    ██ ██████  ██     ██ ██ ██████  ████████ ██   ██ ██████  ██       █████   ██████ ███████
██   ██ ██   ██ ████   ██ ██   ██ ██     ██ ██ ██   ██    ██    ██   ██ ██   ██ ██      ██   ██ ██      ██
██████  ███████ ██ ██  ██ ██   ██ ██  █  ██ ██ ██   ██    ██    ███████ ██████  ██      ███████ ██      █████
██   ██ ██   ██ ██  ██ ██ ██   ██ ██ ███ ██ ██ ██   ██    ██    ██   ██ ██      ██      ██   ██ ██      ██
██████  ██   ██ ██   ████ ██████   ███ ███  ██ ██████     ██    ██   ██ ██      ███████ ██   ██  ██████ ███████
*/

//***************************************
//SEEMS WEBSITE HAS SOME STABILITY ISSUES
//***************************************

function switchToBandwidthplace() {
	address = "http://www.bandwidthplace.com/";
	page.open(address, function(status) {
		if (status !== "success") {
			fs.write("output.txt", "Check internet connection to http://www.bandwidthplace.com/\n", 'w');
			fs.write("output.txt", "F: P: " + "-1 error " + "D: " + "-1 error " + "U: " + "-1 error" + "\n", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestBandwidthplace();
		}
	});
}

function runSpeedtestBandwidthplace() {
	console.log("Bandwidthplace");
	fs.write("output.txt", "Site: Bandwidthplace\nSupports: P U D F\n", 'w');

	page.evaluate(function() {
		var a = document.getElementById("start-button");
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	});

	updater = setInterval(updateSpeedtestDataBandwidthplace, 150);

}

function updateSpeedtestDataBandwidthplace() {
	var state = page.evaluate(function() {
		return document.getElementById("tool-status").innerText;
	});
	var speed = page.evaluate(function() {
		return document.getElementById("tool-speed").innerText;
	});
	var units = page.evaluate(function() {
		return document.getElementById("tool-metrics").innerText;
	});

	//writeCurrPageToFile();

	if (state === "Downloading" && speed !== "--.--") {
		fs.write("output.txt", "D: " + (Math.round(speed * 100) / 100).toFixed(2) + " " + units + "\n", 'a');
	}
	else if (state === "Uploading" && speed !== "--.--") {
		fs.write("output.txt", "U: " + (Math.round(speed * 100) / 100).toFixed(2) + " " + units + "\n", 'a');
	}
	else if (state === "Done" || state === "Ready") {
		clearInterval(updater);
		finalSpeedtestDataBandwidthplace();
	}
}

function finalSpeedtestDataBandwidthplace() {

	//For each of these loc[1] is speed, loc[2] is units
	var ping = page.evaluate(function() {
		return document.getElementById("ping").innerText.replace("Ping", "").split("\n");
	});
	var download = page.evaluate(function() {
		return document.getElementById("download").innerText.replace("Download", "").split("\n");
	});
	var upload = page.evaluate(function() {
		return document.getElementById("upload").innerText.replace("Upload", "").split("\n");
	});

	fs.write("output.txt", "F: P: " + ping[1] + " " + ping[2] + " D: " + download[1] + " " + download[2] + " U: " + upload[1] + " " + upload[2] + "\n", 'a');
	phantom.exit();
}

/*
██████  ███████ ████████  █████     ███████ ██████  ███████ ███████ ██████  ████████ ███████ ███████ ████████
██   ██ ██         ██    ██   ██    ██      ██   ██ ██      ██      ██   ██    ██    ██      ██         ██
██████  █████      ██    ███████    ███████ ██████  █████   █████   ██   ██    ██    █████   ███████    ██
██   ██ ██         ██    ██   ██         ██ ██      ██      ██      ██   ██    ██    ██           ██    ██
██████  ███████    ██    ██   ██ ██ ███████ ██      ███████ ███████ ██████     ██    ███████ ███████    ██
*/

//@TODO Since beta.speedtest.com uses a canvas to display current data, until I can find a way to get the text out of it without ocr support is shelved

/*
██ ███████ ██████      ███████ ██████  ███████ ███████ ██████  ████████ ███████ ███████ ████████ ███████
██ ██      ██   ██     ██      ██   ██ ██      ██      ██   ██    ██    ██      ██         ██    ██
██ ███████ ██████      ███████ ██████  █████   █████   ██   ██    ██    █████   ███████    ██    ███████
██      ██ ██               ██ ██      ██      ██      ██   ██    ██    ██           ██    ██         ██
██ ███████ ██          ███████ ██      ███████ ███████ ██████     ██    ███████ ███████    ██    ███████
*/

/*
 █████  ████████ ██ ████████
██   ██    ██    ██    ██
███████    ██ ████████ ██
██   ██    ██ ██  ██   ██
██   ██    ██ ██████   ██
*/

//@TODO Find a way around AT&T's block (Seems to load some scripts then fail so its a different method)

function switchToATandT() {
	address = "http://speedtest.att.com/speedtest/";
	page.open(address, function(status) {
		if (status !== "success") {
			fs.write("output.txt", "Check internet connection to http://speedtest.att.com/speedtest/\n", 'w');
			fs.write("output.txt", "F: P: " + "-1 error " + "D: " + "-1 error " + "U: " + "-1 error" + "\n", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestATandT();
		}
	});
}

function runSpeedtestATandT() {
	console.log("ATandT");
	fs.write("output.txt", "Site: ATandT\nSupports: P U D F\n", 'w');

	page.evaluate(function() {
		var a = document.getElementById("DRWidgetInitiate");
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	});

	updater = setInterval(updateSpeedtestDataATandT, 150);

}

function updateSpeedtestDataATandT() {
	//AT&T uses and SVG group to show data with dynamic IDs use document.getElementById("highcharts-0").innerText and split

	var info = page.evaluate(function() {
		return document.getElementById("highcharts-0").innerText.split("\n");
	});
	//Order of info through the test
	//["THROUGHPUT", "PERFORMING", "SPEEDTEST", "LATENCY", "UPLOAD", "PERFORMING", "SPEEDTEST", "LATENCY", "32", "ms", "LATENCY", ""]
	//["THROUGHPUT", "PERFORMING", "SPEEDTEST", "DOWNLOAD", "UPLOAD", "PERFORMING", "SPEEDTEST", "70.13", "DOWNLOAD", "Mbps", "DOWNLOAD", "00.2M0.5M1M3M6M12M24M50M100M210M"]
	//["THROUGHPUT", "PERFORMING", "SPEEDTEST", "UPLOAD", "PERFORMING", "SPEEDTEST", "47.8", "DOWNLOAD", "Mbps", "UPLOAD", "Mbps", "7.06", "UPLOAD", "00.2M0.5M1M3M6M12M24M50M100M210M"]
	//["THROUGHPUT", "PERFORMING", "SPEEDTEST", "READY", "UPLOAD", "Mbps", "6.6", "DOWNLOAD", "Mbps", "47.8", ""]

	//writeCurrPageToFile();

	if (info[4] === "DOWNLOAD") {
		fs.write("output.txt", "D: " + (Math.round(info[7] * 100) / 100).toFixed(2) + " " + info[9] + "\n", 'a');
	}
	else if (info[4] === "UPLOAD") {
		fs.write("output.txt", "U: " + (Math.round(info[11] * 100) / 100).toFixed(2) + " " + info[10] + "\n", 'a');
	}
	else if (info[4] === "READY") {
		clearInterval(updater);
		finalSpeedtestDataATandT();
	}
}

function finalSpeedtestDataATandT() {

	//Final results are in a giant table and the download has no label, use document.getElementById("speed").innerText then split by line
	//Loc[0] is download line, Loc[1] is upload line, Loc[2] is ping line
	var results = page.evaluate(function() {
		return document.getElementById("speed").innerText.split("\n");
	});

	fs.write("output.txt", "F: P: " + results[2].replace("Latency   ", "") + " D: " + results[0].split(" ")[4] + " " + results[0].split(" ")[5] + " U: " + results[1].split(" ")[4] + " " + results[1].split(" ")[5] + "\n", 'a');
	phantom.exit();
}

/*
██    ██ ███████ ██████  ██ ███████  ██████  ███    ██
██    ██ ██      ██   ██ ██    ███  ██    ██ ████   ██
██    ██ █████   ██████  ██   ███   ██    ██ ██ ██  ██
 ██  ██  ██      ██   ██ ██  ███    ██    ██ ██  ██ ██
  ████   ███████ ██   ██ ██ ███████  ██████  ██   ████
*/

function switchToVerizon() {
	address = "https://www.verizon.com/speedtest/";
	page.open(address, function(status) {
		if (status !== "success") {
			fs.write("output.txt", "Check internet connection to https://www.verizon.com/speedtest/\n", 'w');
			fs.write("output.txt", "F: P: " + "-1 error " + "D: " + "-1 error " + "U: " + "-1 error" + "\n", 'a');
			phantom.exit();
		}
		else {
			runSpeedtestVerizon();
		}
	});
}

function runSpeedtestVerizon() {
	console.log("Verizon");
	fs.write("output.txt", "Site: Verizon\nSupports: P U D F\n", 'w');
	writeCurrPageToFile();
	page.evaluate(function() {
		var a = document.getElementById("startButton");
		//var a = document.getElementById("start-router-test-button");
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	});

	doneAllInfoTypes = false;
	updater = setInterval(updateSpeedtestDataVerizon, 150);

}

function updateSpeedtestDataVerizon() {

	//Verizon does not ID anything in their speedtest
	var info = page.evaluate(function() {
		return document.getElementById("the-speedtest-meter").innerText.split("\n");
	});
	var uploadBlockStyle = page.evaluate(function() {
		return document.getElementById("results-upload").style.display;
	});

	//                                                                                                                                                                                      Loc[36]=1Gig
	//["0", "·", "·", "·", "·", "|", "·", "·", "·", "20", "·", "·", "·", "·", "|", "·", "·", "·", "75", "·", "·", "·", "·", "|", "·", "·", "·", "400", "·", "·", "·", "·", "|", "·", "·", "·", "1Gig", ""]
	//["0", "·", "·", "·", "·", "|", "·", "·", "·", "20", "·", "·", "·", "·", "|", "·", "·", "·", "75", "·", "·", "·", "·", "|", "·", "·", "·", "400", "·", "·", "·", "·", "|", "·", "·", "·", "1Gig", "Mbps", "DOWNLOAD", "19", ".", "50", ""]
	//["0", "·", "·", "·", "·", "|", "·", "·", "·", "20", "·", "·", "·", "·", "|", "·", "·", "·", "75", "·", "·", "·", "·", "|", "·", "·", "·", "400", "·", "·", "·", "·", "|", "·", "·", "·", "1Gig", "Mbps", "UPLOAD", "6", ".", "68", ""]
	//["0", "·", "·", "·", "·", "|", "·", "·", "·", "20", "·", "·", "·", "·", "|", "·", "·", "·", "75", "·", "·", "·", "·", "|", "·", "·", "·", "400", "·", "·", "·", "·", "|", "·", "·", "·", "1Gig", ""]

	writeCurrPageToFile();

	//Check if done first to prevent outofbounds error
	if (uploadBlockStyle === "block" && info[37] === "") {
		clearInterval(updater);
		finalSpeedtestDataVerizon();
	}
	else if (info[38] === "DOWNLOAD") {
		var speedDown = info[39] + info[40] + info[41];
		fs.write("output.txt", "D: " + (Math.round(speedDown * 100) / 100).toFixed(2) + " " + info[37] + "\n", 'a');
	}
	else if (info[38] === "UPLOAD") {
		var speedUp = info[39] + info[40] + info[41];
		fs.write("output.txt", "U: " + (Math.round(speedUp * 100) / 100).toFixed(2) + " " + info[37] + "\n", 'a');
	}
	else {
		var didFail = page.evaluate(function() {
			return document.getElementsByClassName("test-failed")[1].style.display;
		});
		if(didFail === "")
		{
			console.log("Verizon speedtest failed");
			clearInterval(updater);
			//@TODO add fail reason before it?
			fs.write("output.txt", "Check internet connection to https://www.verizon.com/speedtest/\n", 'w');
			fs.write("output.txt", "F: P: " + "-1 error " + "D: " + "-1 error " + "U: " + "-1 error" + "\n", 'a');
			phantom.exit();
		}
	}
}

function finalSpeedtestDataVerizon() {

	//Verizon seems to have support for ping in the page but not support it but this is where it would go
	//var ping = page.evaluate(function() {
	//	return document.getElementById("results-ping");
	//});
	//var pingUnits = page.evaluate(function() {
	//	return document.getElementsByClassName("value-type")[2];
	//});

	var ping = page.evaluate(function() {
		//Another place where I found ping on their page, seems to be enter on page load
		return document.getElementsByClassName("test-value")[0].innerText.replace("										", "").replace("										", "").split("\n");
	});
	var download = page.evaluate(function() {
		//Lol verizon thats not an int
		return document.getElementById("results-download-int");
	});
	var downloadUnits = page.evaluate(function() {
		return document.getElementsByClassName("value-type")[0];
	});
	var upload = page.evaluate(function() {
		//Lol verizon thats not an int
		return document.getElementById("results-upload-int");
	});
	var uploadUnits = page.evaluate(function() {
		return document.getElementsByClassName("value-type")[1];
	});

	fs.write("output.txt", "F: P: " + ping[1] + " " + ping[2] + " D: " + download + " " + downloadUnits + " U: " + upload + " " + uploadUnitsd + "\n", 'a');
	phantom.exit();
}

/*
 ██████  ██████  ███    ███  ██████  █████  ███████ ████████
██      ██    ██ ████  ████ ██      ██   ██ ██         ██
██      ██    ██ ██ ████ ██ ██      ███████ ███████    ██
██      ██    ██ ██  ██  ██ ██      ██   ██      ██    ██
 ██████  ██████  ██      ██  ██████ ██   ██ ███████    ██
*/

//@TODO Find a way around Comcast's phantomjs block (Seems to be the same as speedofme)


function writeCurrPageToFile() {
	fs.write(outputCount + "output.html", page.evaluate(function() {
		return document.body.innerHTML;
	}), 'w');
	outputCount++;
}
