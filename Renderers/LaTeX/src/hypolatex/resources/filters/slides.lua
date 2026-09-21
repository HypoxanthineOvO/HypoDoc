-- Product semantics with Pandoc-native listings and fragile-frame handling.
local root = PANDOC_SCRIPT_FILE:match("^(.*[/\\])") or ""
dofile(root .. "hypolatex.lua")
local product_div = Div
local product_header = Header
CodeBlock = nil
local function render_div(div)
  if div.classes:includes("table") then
    div.attributes.width = div.attributes.width or "0.8"
    div.attributes.density = div.attributes.density or "normal"
  end
  return product_div(div)
end
local function image(image)
  image.attributes.width = image.attributes.width or "80%"
  image.attributes.height = image.attributes.height or "45%"
  return image
end
return {
  {
    traverse = "topdown",
    Div = function(div)
      if div.classes:includes("table") then return div, false end
    end,
    Table = function(tbl)
      -- The same backend/style serves ordinary and explicitly configured tables.
      return pandoc.Div({tbl}, pandoc.Attr("", {"table"}, {width="0.8"})), false
    end,
  },
  {
    Div = render_div, Image = image, Meta = Meta,
    Header = function(header)
      if header.level == 3 and not header.classes:includes("fragile") then
        header.classes:insert("fragile")
      end
      return product_header(header)
    end,
  },
}
