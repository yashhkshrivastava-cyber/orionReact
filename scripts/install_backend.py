#!/usr/bin/env python3
"""Install backend deps when platform.mac_ver() is broken (macOS 26 + Homebrew Python)."""
from __future__ import annotations

import platform
import subprocess
import sys
from pathlib import Path

# Must patch before any pip/packaging imports.
platform.mac_ver = lambda: ("14.0", ("", "", ""), "arm64")  # type: ignore[method-assign]

ROOT = Path(__file__).resolve().parents[1]
VENV_PY = ROOT / ".venv" / "bin" / "python"
REQ = ROOT / "backend" / "requirements.txt"


def main() -> int:
    if not VENV_PY.exists():
        print("Missing .venv — run: bash scripts/install-mac.sh", file=sys.stderr)
        return 1

    env = {
        **dict(__import__("os").environ),
        "PIP_USE_TRUSTSTORE": "false",
        "MACOSX_DEPLOYMENT_TARGET": "14.0",
    }

    # Download wheels first (no install hook issues).
    dl = subprocess.run(
        [str(VENV_PY), "-m", "pip", "download", "-r", str(REQ), "-d", str(ROOT / ".pip-cache")],
        env=env,
        cwd=ROOT,
    )
    if dl.returncode != 0:
        return dl.returncode

    # Install from local wheels without resolver/build isolation.
    inst = subprocess.run(
        [
            str(VENV_PY),
            "-m",
            "pip",
            "install",
            "--no-index",
            f"--find-links={ROOT / '.pip-cache'}",
            "-r",
            str(REQ),
            "--no-build-isolation",
        ],
        env=env,
        cwd=ROOT,
    )
    return inst.returncode


if __name__ == "__main__":
    raise SystemExit(main())
