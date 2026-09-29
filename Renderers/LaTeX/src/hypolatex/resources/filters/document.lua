-- Document-only semantic preparation. Run before the legacy layout filter so
-- canonical assessments are validated while the complete tree is available.
local stringify = pandoc.utils.stringify
local function name(div) return div.classes[1] end
local function identifier(div)
  local id, label = div.identifier, div.attributes.label or ""
  if id ~= "" and label ~= "" and id ~= label then
    error("conflicting ID and label: " .. id .. " / " .. label)
  end
  return id ~= "" and id or label
end
local function safe_id(value)
  if not value:match("^[%w][%w:_.%-]*$") then error("invalid reference identifier: " .. value) end
  return value
end
local function children(div, kind)
  local result = {}
  for _, block in ipairs(div.content) do
    if block.t == "Div" and name(block) == kind then result[#result + 1] = block end
  end
  return result
end
local function choice_tokens(value)
  local tokens = {}
  for token in (value or ""):gmatch("[^,%s]+") do tokens[#tokens + 1] = token end
  return tokens
end

local function assessment(div)
  local kind = div.attributes.kind
  -- Preserve legacy LaTeX-only grouped question cards without a canonical kind.
  if kind == nil then return nil end
  if kind ~= "open" and kind ~= "single-choice" and kind ~= "multiple-choice" then
    error("unsupported qa kind: " .. kind)
  end
  if div.identifier == "" then error("canonical qa requires an ID") end
  safe_id(div.identifier)
  if #children(div, "question") ~= 1 then error("qa requires exactly one question") end
  for i, part in ipairs(div.content) do
    if part.t == "Div" and name(part) == "question" and identifier(part) == "" then
      part.attributes.label = div.identifier
      div.content[i] = part
    end
  end
  for _, part in ipairs(div.content) do
    local n = part.t == "Div" and name(part) or ""
    if n ~= "question" and n ~= "hint" and n ~= "choices" and n ~= "answer" and n ~= "solution" then
      error("unsupported content inside qa: " .. n)
    end
  end
  local groups = children(div, "choices")
  local answers = children(div, "answer")
  if #answers > 1 then error("qa permits at most one answer") end
  if kind == "open" then
    if #groups ~= 0 then error("open qa cannot contain choices") end
    if #answers == 1 and answers[1].attributes.choices then error("open qa cannot select choices") end
    return div
  end
  if #groups ~= 1 or #groups[1].content == 0 then error("choice qa requires nonempty choices") end
  local labels, items = {}, {}
  for index, choice in ipairs(groups[1].content) do
    if choice.t ~= "Div" or name(choice) ~= "choice" or choice.identifier == "" then
      error("choices must contain only choice blocks with IDs")
    end
    safe_id(choice.identifier)
    if labels[choice.identifier] then error("duplicate choice ID: " .. choice.identifier) end
    if index > 26 then error("choice qa supports at most 26 options") end
    labels[choice.identifier] = string.char(64 + index)
    items[#items + 1] = choice.content
  end
  if #answers == 1 then
    local selected, visible, seen = choice_tokens(answers[1].attributes.choices), {}, {}
    if #selected == 0 or (kind == "single-choice" and #selected ~= 1) then
      error("answer must select " .. (kind == "single-choice" and "exactly one choice" or "at least one choice"))
    end
    for _, id in ipairs(selected) do
      if not labels[id] then error("unknown selected choice: " .. id) end
      if seen[id] then error("duplicate selected choice: " .. id) end
      seen[id] = true
      visible[#visible + 1] = labels[id]
    end
    answers[1].content:insert(1, pandoc.Para({pandoc.Str("参考选项：" .. table.concat(visible, "、"))}))
  end
  -- Replace before the legacy filter sees choices/choice, never silently drop them.
  local content = pandoc.List()
  for _, part in ipairs(div.content) do
    if part.t == "Div" and name(part) == "choices" then
      content:insert(pandoc.OrderedList(items, pandoc.ListAttributes(1, "UpperAlpha", "Period")))
    else content:insert(part) end
  end
  div.content = content
  return div
end

function Pandoc(doc)
  local mode = stringify(doc.meta.answer_mode or "student")
  local numbered = doc.meta.number_headings
  if numbered ~= nil and type(numbered) ~= "boolean" then error("number_headings must be a boolean") end
  doc = doc:walk({traverse = "topdown", Div = function(div)
    if name(div) == "qa" then return assessment(div) end
  end})
  doc = doc:walk({traverse = "topdown", Div = function(div)
    local n = name(div)
    if n == "choice" or n == "choices" then error(n .. " must be inside a canonical choice qa") end
    if mode == "student" and (n == "answer" or n == "solution") then return {} end
  end})
  local targets = {}
  doc = doc:walk({
    Header = function(header)
      if numbered == false then header.classes:insert("unnumbered") end
      return header
    end,
    Div = function(div)
      local n = name(div)
      if n == "figure" or n == "table" or n == "question" then
        local id = identifier(div)
        if id ~= "" then
          safe_id(id)
          if targets[id] then error("duplicate reference target: " .. id) end
          targets[id] = n
          div.attributes.label = id
        end
        if n == "figure" and (not div.attributes.src or div.attributes.src == "") then
          error("figure requires src")
        end
      end
      return div
    end,
  })
  doc = doc:walk({Div = function(div)
    if name(div) ~= "ref" then return nil end
    local target = div.attributes.target or ""
    if not targets[target] then error("missing or hidden reference target: " .. target) end
    local prefix = ({figure = "图", table = "表", question = "题"})[targets[target]]
    return pandoc.RawBlock("latex", "\\HypoTypedRef{" .. prefix .. "}{" .. safe_id(target) .. "}")
  end})
  return doc
end
