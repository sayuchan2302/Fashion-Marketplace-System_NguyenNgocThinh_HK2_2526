from __future__ import annotations

from pathlib import Path
import unittest


class DockerComposeVisionConfigTests(unittest.TestCase):
    def test_healthcheck_uses_ready_endpoint(self) -> None:
        compose_path = Path(__file__).resolve().parents[2] / "docker-compose.vision.yml"
        content = compose_path.read_text(encoding="utf-8")

        self.assertIn("http://127.0.0.1:8001/ready", content)
        self.assertIn("body.get('ready') is True", content)
        self.assertNotIn("http://127.0.0.1:8001/health", content)


if __name__ == "__main__":
    unittest.main()
