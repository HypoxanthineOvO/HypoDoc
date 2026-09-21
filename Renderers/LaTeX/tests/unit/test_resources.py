import pytest

from hypolatex import resource_files


@pytest.mark.parametrize("reference", ["../outside.png", "/outside.png", "https://example.com/x.png", "data:image/png;base64,xx"])
def test_unsafe_resource_cannot_resolve(tmp_path, reference):
    assert resource_files._resolve_resource(reference, (tmp_path,)) is None


def test_symlink_cannot_escape_resource_root(tmp_path):
    root = tmp_path / "document"
    root.mkdir()
    outside = tmp_path / "outside.png"
    outside.write_bytes(b"outside")
    (root / "linked.png").symlink_to(outside)
    assert resource_files._resolve_resource("linked.png", (root,)) is None


def test_corrupt_image_is_not_replaced_by_placeholder(tmp_path):
    source = tmp_path / "bad.png"
    source.write_bytes(b"not a PNG")
    destination = tmp_path / "copy.png"
    with pytest.raises(resource_files.ResourceError, match="Invalid PNG"):
        resource_files._copy_resource(source, destination)
    assert not destination.exists()


def test_missing_resource_requires_explicit_opt_in(tmp_path, monkeypatch):
    source = tmp_path / "document.md"
    source.write_text("# Document\n", encoding="utf-8")
    monkeypatch.setattr(resource_files, "_markdown_resource_references", lambda _: ("assets/missing.png",))
    with pytest.raises(resource_files.ResourceError, match="missing.png"):
        resource_files.prepare_markdown_resources(source, tmp_path / "build")
    result = resource_files.prepare_markdown_resources(source, tmp_path / "build", allow_missing=True)
    assert result.missing == ("assets/missing.png",)
