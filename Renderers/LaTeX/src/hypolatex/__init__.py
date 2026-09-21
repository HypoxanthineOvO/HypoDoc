"""Hypo-LaTeX command line package."""

from importlib.metadata import PackageNotFoundError, version

try:
    __version__ = version("hypolatex")
except PackageNotFoundError:
    __version__ = "0+uninstalled"
