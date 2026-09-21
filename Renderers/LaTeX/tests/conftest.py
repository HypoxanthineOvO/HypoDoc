"""Shared test paths. Unit tests never need a prepared developer machine."""

from pathlib import Path

import pytest
from typer.testing import CliRunner

from hypolatex.cli import app


@pytest.fixture
def runner():
    return CliRunner()


@pytest.fixture
def cli_app():
    return app


@pytest.fixture(scope="session")
def repo_root():
    return Path(__file__).resolve().parents[3]


@pytest.fixture(scope="session")
def templates(repo_root):
    return repo_root / "Renderers/LaTeX/src/hypolatex/resources/starters"
