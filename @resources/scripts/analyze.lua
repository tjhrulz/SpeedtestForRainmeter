function analyzeResults()
  local file = io.open(SKIN:GetVariable("@") .. "scripts\\output.txt", "r")
  --io.output(file)
  local contents = file:read("*all")
  --contents = string.sub(contents, string.find(your_string, "\n[\n]*$"), -1)
  contents = string.sub(contents, contents:match'^.*()\n*\n', -1)
  file:close()

  print(contents)
end
