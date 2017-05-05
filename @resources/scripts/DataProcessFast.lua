function clearoutput()
	file = io.open(SKIN:GetVariable("@") .. "Scripts\\output.txt", "w")
	file:write("nah")
	file:close()
end

timing,timing2,timing3,timing4,timing5,timing6,timing7 = -1,0,0,0,0,0,0
percent = 0
reading = false
thereError = false
curMeasure = "Welcome"
color={"default","fast","google","speedof","bandwidthplace","xfinity","atandt","comcast","verizon"}
color.default		= {['sR'] = 011, ['sG'] = 018, ['sB'] = 031}
color.fast			= {['sR'] = 229, ['sG'] = 009, ['sB'] = 020, ['lH1'] = 'cb2d3e', ['lH2'] = 'ef473a'}
color.google		= {['sR'] = 000, ['sG'] = 145, ['sB'] = 234, ['lH1'] = '36D1DC', ['lH2'] = '5B86E5'}
color.verizon		= {['sR'] = 205, ['sG'] = 004, ['sB'] = 011, ['lH1'] = '8E0E00', ['lH2'] = '1F1C18'}
color.bandwidthplace= {['sR'] = 243, ['sG'] = 070, ['sB'] = 000, ['lH1'] = 'FF512F', ['lH2'] = 'F09819'}
--color.speedof		= {['sR'] = 033, ['sG'] = 060, ['sB'] = 046, ['lH1'] = '000000', ['lH2'] = '000000'}
--color.xfinity		= {['sR'] = 046, ['sG'] = 160, ['sB'] = 221, ['lH1'] = '000000', ['lH2'] = '000000'}
--color.atandt		= {['sR'] = 243, ['sG'] = 070, ['sB'] = 000, ['lH1'] = '000000', ['lH2'] = '000000'}

function Initialize()
	cursite = SKIN:GetVariable('defaultsite')
	site = cursite
	sbg('SetOption LoadingBar Grad \"180|'..color[site]["lH1"]..'b4;0|'..color[site]["lH2"]..'b4;1','UpdateMeter LoadingBar',
		'SetOptionGroup Site FontColor ' ..color["default"]["sR"]..','..color["default"]["sG"]..','..color["default"]["sB"]..',56',
		'SetOption '..site..' FontColor '..color[site]["sR"]..','..color[site]["sG"]..','..color[site]["sB"],
		'UpdateMeterGroup Site')
end

function Update()
	measures = {}
	speeds = {}
	units = {}

	if reading then
		local file = io.open(SKIN:GetVariable("@") .. "Scripts\\output.txt", "r")
		contents = file:read("*a")
		if contents == nil then return end
		file:close()
		oSite = contents:match("Site:%s(%w+)")

		for measure,speed,unit in string.gmatch(contents,"\n([PUD]):%s(.-)%s(%w+)\n") do
			table.insert(measures,measure)
			table.insert(speeds,speed)
			table.insert(units,unit)
		end

		final,finalDetail = string.match(contents,"(F):%s(.*)\n") --Find final result

		if measures[#measures] ~= nil then 
			if measures[#measures] ~= curMeasure then  --Switch measurement trigger
				oldMeasure = curMeasure
				curMeasure = measures[#measures]
				timing6 = 1
			end
		end

		if final == "F" then
			local split = 0
			--Display all available final result
			for finalN,finalV in string.gmatch(finalDetail,"(.):%s(.-%s%w+)") do
				if finalV == '-1 error' then
					reading = false
					thereError = true
					timing = 1
					return
				end

				sbg('SetOption '..finalN..' FontSize 14',
					'SetOption '..finalN..'Icon FontSize 16',
					'SetOptionGroup '..finalN..' FontColor \"255,255,255,(255*#*final*#)\"',
					'SetOptionGroup '..finalN..' Y \"(60*#*final*#-31)\"',
					'SetOption '..finalN..'Icon X 15R',
					'SetOption '..finalN..' X 5R',
					'SetOPtion '..finalN..' Text \"'..finalV..'\"')

				if split == 0 then sbg('SetOption '..finalN..'Icon X 40') end

				split = split + 1
			end
			uGY = SKIN:GetMeter('UGraph'):GetY()
			dGY = SKIN:GetMeter('DGraph'):GetY()
			pGY = SKIN:GetMeter('PGraph'):GetY()
			reading = false
			sbg('SetOption Stop Text ','UpdateMeter Stop') --Change to tick symbol
			timing2=0
			timing3=1
			timing7=1
			return
		elseif speeds[#speeds] ~= nil and start then
			timing2=1
			start = false
		end

		if speeds[#speeds] ~= nil and units[#units] ~= 'null' then --suppress 'nil concentration' error log
			timing = 0
			graph(curMeasure)
			sbg('SetOption '..curMeasure..' Text \"'..speeds[#speeds]..' '..units[#units]..'\"','UpdateMeter '..curMeasure)
		end
	end

	if timing > 0 and timing < 100 then --flickering text
		timing=timing+1
		sbg('SetOption Welcome FontColor 255,255,255,'..255*timing/20)
		if thereError then
			sbg('SetOption Welcome Text \"error, refresh and try again\"',
				'UpdateMeter Welcome')
		else
			sbg('SetOption Welcome Text \"please wait...\"',
				'UpdateMeter Welcome')
		end
	elseif timing == 100 then
		timing = 1
	elseif timing == 0 then
		timing = -1
		sbg('SetOption '..curMeasure..' FontColor 255,255,255','UpdateMeter '..curMeasure)
	end

	if timing2 > 0 and timing2 < 500 then
		timing2 = timing2 + (1-timing2 / 500) -- More it increases, slower the rate. So it's never 100 percent
		percent = timing2 / 500
		sbg('SetVariable percent '..percent,'UpdateMeter LoadingBar')
	elseif timing2 == 500 then
		measures[#measures] = "F"
		timing2 = 501
	end

	if timing3 > 0 and timing3 < 10 then
		timing3 = timing3 + 1
		percentfin = percent + (1-percent)*outQuart(timing3,0,1,10) --Push percent bar to 100 percent
		sbg('SetVariable percent '..percentfin,'UpdateMeter LoadingBar')
	elseif timing3 == 10 then
		sbg('SetVariable percent 1','UpdateMeter LoadingBar')
		timing3 = 11
		timing4 = 1
	end

	if timing4 > 0 and timing4 < 50 then
		timing4 = timing4 + 1
		sbg('SetOptionGroup M InlineSetting3 \"Shadow|0|0|'..(5*timing4/50)..'|000000\"',
			'UpdateMeterGroup M')
	elseif timing4 == 50 then
		timing4 = 51
		sbg('SetOption Stop Text ','UpdateMeter Stop','ShowMeter Share') --Change to Restart symbol
	end

	if timing5 > 0 and timing5 < 20 then --Change Sites color
		timing5 = timing5 + 1
		siteAnimate=outQuart(timing5,0,1,20)
		gottagofastAnimate=outElastic(timing5,0,1,20,0.1)

		sbg('SetOptionGroup Site FontColor ' ..color["default"]["sR"]..','..color["default"]["sG"]..','..color["default"]["sB"]..',56',
			'SetOption '..site..' FontColor '..(color["default"]["sR"]+(color[site]["sR"]-color["default"]["sR"])*siteAnimate)..','..(color["default"]["sG"]+(color[site]["sG"]-color["default"]["sG"])*siteAnimate)..','..(color["default"]["sB"]+(color[site]["sB"]-color["default"]["sB"])*siteAnimate),
			'UpdateMeterGroup Site',
			'SetOption Base Shape \"Rectangle (['..cursite..':X]+(['..site..':X]-['..cursite..':X])*'..gottagofastAnimate..'-10),27,(['..cursite..':W]+(['..site..':W]-['..cursite..':W])*'..gottagofastAnimate..'+20),60,3 | StrokeWidth 0 | Fill LinearGradient Shadow\"',
			'UpdateMeter Base')
	elseif timing5 == 20 then
		timing5 = 21
	end

	if timing6 > 0 and timing6 < 20 then --Change measure
		timing6 = timing6+1
		switchAnimate=outQuart(timing6,0,1,20)

		if curMeasure ~= 'F' then
			sbg('SetOptionGroup '..oldMeasure..' Y '..(30 - 60 * switchAnimate),
				'SetOptionGroup '..oldMeasure..' FontColor 255,255,255,'..(255-255*switchAnimate),
				'SetOptionGroup '..curMeasure..' Y '..(-30 + 60 * switchAnimate),
				'SetOptionGroup '..curMeasure..' FontColor 255,255,255,'..255*switchAnimate,
				'SetOption '..oldMeasure..'Graph Y '..(45 - 50 * switchAnimate),
				'SetOption '..curMeasure..'Graph Y '..(-5 + 50 * switchAnimate),
				'UpdateMeter '..oldMeasure..'Graph','UpdateMeter '..curMeasure..'Graph',
				'UpdateMeterGroup '..oldMeasure,'UpdateMeterGroup '..curMeasure)
		end
	elseif timing6 == 20 then
		timing6 = 21
	end

	if timing7 > 0 and timing7 < 40 then --Final result out
		timing7 = timing7 + 1
		slideoutAnimate = outQuart(timing7,0,1,40)
		sbg('SetVariable final '..slideoutAnimate,'UpdateMeterGroup F',
			'SetOption UGraph Y '..uGY-50*slideoutAnimate,
			'SetOption DGraph Y '..dGY-50*slideoutAnimate,
			'SetOption PGraph Y '..pGY-50*slideoutAnimate,
			'UpdateMeterGroup G')
	elseif timing7 == 40 then
		sbg('SetOptionGroup M ClipStringW 100','SetOptionGroup M ClipString 2','SetVariable final 1','UpdateMeterGroup F')
		timing7 = 41
	end
end

function sbg(...) --concentrate bangs
	bangs=''
	for i,v in ipairs(arg) do
		bangs = bangs .. '[!' .. tostring(v) .. ']'
	end
	SKIN:Bang(bangs)
end

function graph(s)
	size = SKIN:GetVariable('height') * 0.7 --70% skin height
	width = tonumber(SKIN:GetVariable('graphwidth') )
	path ='0,0'
	for k,v in pairs(speeds) do
		local value={}
		oldData = 0
		for k,v in pairs(speeds) do --Parse speed and scale with unit
			local u = units[k]
			if u == 'Kbps' then 
				u = 1/1000
			elseif u == 'Mbps' then 
				u = 1
			elseif u == 'null' then
				u = 0
			end
			if s == measures[k] then
				value[#value+1] = v*u
			else
				oldData = oldData+1
			end
		end
		--Get max, min and step
		table.sort(value)
		local max=value[#value]
		local step = 0
		if max ~= 0 then
			step = size / max
		end

		local u = units[k]
		if u == 'Kbps' then 
			u = 1/1000
		elseif u == 'Mbps' then 
			u = 1
		elseif u == 'null' then
			u = 0
		end
		if (#speeds*SKIN:GetVariable('graphdistance')) > width then sbg('SetVariable graphdistance (#graphdistance#-0.1)') end
		--Draw paths
		if s == measures[k] then
			path = path .. '|Lineto ('..(k-oldData)..'*#*graphdistance*#),'..(-v*step*u)
		end
	end
	path = path .. '|ClosePath 0'
	sbg('SetOption '..s..'Graph Graph \"'..path..'\"','UpdateMeter '..s..'Graph')
end

function changesite(s)
	cursite = site
	site = s
	sbg('SetOption LoadingBar Grad \"180|'..color[site]["lH1"]..'b4;0|'..color[site]["lH2"]..'b4;1','UpdateMeter LoadingBar')
	timing5 = 1
end

function outElastic(t, b, c, d, a, p)
  if t == 0 then return b end

  t = t / d

  if t == 1 then return b + c end

  if not p then p = d * 0.8 end

  local s

  if not a or a < math.abs(c) then
    a = c
    s = p / 4
  else
    s = p / (2 * math.pi) * math.asin(c/a)
  end

  return a * math.pow(2, -10 * t) * math.sin((t * d - s) * (2 * math.pi) / p) + c + b
end

function outQuart(t, b, c, d)
  t = t / d - 1
  return -c * (math.pow(t, 4) - 1) + b
end
