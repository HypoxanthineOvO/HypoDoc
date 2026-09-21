from hypolatex.build_diagnostics import collect


def test_successful_compiler_warnings_keep_tex_location_and_frame():
    tex = "\\begin{frame}{First}\nBody\n\\end{frame}\n\\begin{frame}{Second}\nBody\n\\end{frame}"
    log = "Overfull \\vbox (22.4pt too high) detected at line 6\nMissing character: no 字 in font\nHYPODOC-FONT-FALLBACK: code -> Latin Modern Mono\n"
    report = collect(log, tex)
    assert report[0].frame_title == "Second"
    assert report[0].tex_line == 6
    assert [d.code for d in report] == ["LAYOUT_OVERFLOW", "MISSING_GLYPH", "FONT_FALLBACK"]


def test_duplicate_warnings_are_not_repeated():
    warning = "Overfull \\hbox (5pt too wide) at lines 2--3\n"
    assert len(collect(warning * 3, "")) == 1
