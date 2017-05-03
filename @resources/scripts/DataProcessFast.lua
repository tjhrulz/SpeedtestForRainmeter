﻿function clearoutput()
	file = io.open(SKIN:GetVariable("@") .. "Scripts\\output.txt", "w")
	file:write("nah")
	file:close()
end

timing,timing2,timing3,timing4 = 0,0,0,0
reading = false

function Update()
	speeds = {}
	units = {}
	if reading then
		local file = io.open(SKIN:GetVariable("@") .. "Scripts\\output.txt", "r")
		if file == nil then return end
		contents = file:read("*a")
		file:close()

		for speed,unit in string.gmatch(contents,"D:%s(.-)%s(%w+)\n") do
			table.insert(speeds,speed)
			table.insert(units,unit)
		end

		if speeds[#speeds] == 'Done' then
			reading = false
			sbg('SetOption Stop Text ','UpdateMeter Stop') --Change to tick symbol
			timing2=0
			timing3=1
			return
		elseif speeds[#speeds] == '0.00' then
			timing2=1
		end

		if speeds[#speeds] ~= nil and units[#units] ~= 'none' then --suppress 'nil concentration' error log
			timing = 0
			graph()
			sbg('SetOption Down Text \"'..speeds[#speeds]..' '..units[#units]..'\"','UpdateMeter Down')
		end
	end

	if timing > 0 and timing < 100 then --flickering text
		timing=timing+1
		sbg('SetOption Down FontColor 255,255,255,'..255*timing/20,
			'SetOption Down Text \"Please wait...\"',
			'UpdateMeter Down')
	elseif timing == 100 then
		timing = 1
	elseif timing == 0 then
		timing = -1 
		sbg('SetOption Down FontColor 255,255,255','UpdateMeter Down')
	end

	if timing2 > 0 and timing2 < 300 then
		percent = timing2 / 300
		timing2 = timing2 + (1-percent) -- More it increases, slower the rate. So it's never 100 percent
		sbg('SetVariable percent '..percent,'UpdateMeter LoadingBar')
	elseif timing2 == 300 then
		timing2 = 301
	end

	if timing3 > 0 and timing3 < 10 then
		timing3 = timing3 + 1
		percentfin = percent + (1-percent)*outQuart(timing3,0,1,10) --Push percent bar to 100 percent
		sbg('SetVariable percent '..percentfin,'UpdateMeter LoadingBar')
	elseif timing3 == 10 then
		timing3 = 11
		timing4 = 1
	end

	if timing4 > 0 and timing4 < 100 then
		timing4 = timing4 + 1
	elseif timing4 == 100 then
		timing4 = 101
		sbg('SetOption Stop Text ','UpdateMeter Stop') --Change to Restart symbol
	end
end

function sbg(...) --concentrate bangs
	bangs=''
	for i,v in ipairs(arg) do
		bangs = bangs .. '[!' .. tostring(v) .. ']'
	end
	SKIN:Bang(bangs)
end

function outQuart(t, b, c, d)
  t = t / d - 1
  return -c * (math.pow(t, 4) - 1) + b
end

function graph()
	size = SKIN:GetVariable('height') * 0.8 --80% skin height
	width = tonumber(SKIN:GetVariable('graphwidth') )
	path ='0,0'
	

	for k,v in pairs(speeds) do
		local value={}
		for k,v in pairs(speeds) do --Parse speed and scale with unit
			local u = units[k]
			if u == 'Kbps' then 
				u = 1/1000
			elseif u == 'Mbps' then 
				u = 1
			elseif u == 'none' then
				u = 0
			end
			value[#value+1] = v*u
		end
		--Get max, min and step
		table.sort(value)
		local max,min=value[#value],value[1]
		local step = 0
		if (max - min) ~= 0 then
			step = size / (max - min)
		end

		local u = units[k]
		if u == 'Kbps' then 
			u = 1/1000
		elseif u == 'Mbps' then 
			u = 1
		elseif u == 'none' then
			u = 0
		end
		if (#speeds*SKIN:GetVariable('graphdistance')) > width then sbg('SetVariable graphdistance (#graphdistance#-0.1)') end
		--Draw paths
		path = path .. '|Lineto ('..(k)..'*#*graphdistance*#),'..(-v*step*u)
	end
	path = path .. '|ClosePath 0'
	sbg('SetOption Graph Graph \"'..path..'\"')
end