#!/usr/bin/env python3
"""Run a small deterministic code-style eval against a patch fixture."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class PatchStats:
    changed_files: list[str]
    changed_line_count: int
    text: str


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text())
    except FileNotFoundError:
        raise SystemExit(f"Config not found: {path}")
    except json.JSONDecodeError as error:
        raise SystemExit(f"Invalid JSON in {path}: {error}")


def parse_patch(path: Path) -> PatchStats:
    try:
        text = path.read_text()
    except FileNotFoundError:
        raise SystemExit(f"Patch fixture not found: {path}")

    changed_files: list[str] = []
    for line in text.splitlines():
        if not line.startswith("+++ b/"):
            continue
        changed_files.append(line.removeprefix("+++ b/"))

    changed_line_count = 0
    for line in text.splitlines():
        if line.startswith(("+++", "---")):
            continue
        if line.startswith(("+", "-")):
            changed_line_count += 1

    return PatchStats(
        changed_files=sorted(set(changed_files)),
        changed_line_count=changed_line_count,
        text=text,
    )


def criterion_passes(criterion: dict[str, Any], stats: PatchStats, root: Path) -> tuple[bool, str]:
    criterion_type = criterion.get("type")

    if criterion_type == "changed_files_exist":
        missing = [path for path in stats.changed_files if not (root / path).exists()]
        if missing:
            return False, f"missing changed files: {', '.join(missing)}"
        return True, f"{len(stats.changed_files)} changed file(s) exist"

    if criterion_type == "max_changed_files":
        maximum = int(criterion["max"])
        count = len(stats.changed_files)
        return count <= maximum, f"changed files: {count}/{maximum}"

    if criterion_type == "max_changed_lines":
        maximum = int(criterion["max"])
        count = stats.changed_line_count
        return count <= maximum, f"changed lines: {count}/{maximum}"

    if criterion_type == "forbid_regex":
        pattern = criterion["pattern"]
        match = re.search(pattern, stats.text, flags=re.MULTILINE)
        if match:
            return False, f"forbidden pattern matched: {pattern!r}"
        return True, f"forbidden pattern absent: {pattern!r}"

    return False, f"unknown criterion type: {criterion_type}"


def run_eval(config_path: Path) -> int:
    root = repo_root()
    config = load_json(config_path)
    fixture_path = root / config["fixture"]
    stats = parse_patch(fixture_path)

    print(f"Eval: {config.get('id', config_path.stem)}")
    print(f"Fixture: {fixture_path.relative_to(root)}")

    failures: list[str] = []
    for criterion in config.get("criteria", []):
        passed, message = criterion_passes(criterion, stats, root)
        status = "PASS" if passed else "FAIL"
        criterion_id = criterion.get("id", criterion.get("type", "unknown"))
        print(f"{status} {criterion_id}: {message}")
        if not passed:
            failures.append(criterion_id)

    if failures:
        print(f"Result: FAIL ({', '.join(failures)})")
        return 1

    print("Result: PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path, help="Path to eval JSON config")
    args = parser.parse_args()

    config_path = args.config
    if not config_path.is_absolute():
        config_path = Path.cwd() / config_path

    return run_eval(config_path)


if __name__ == "__main__":
    sys.exit(main())
