from __future__ import annotations

from pathlib import Path
import sys
import unittest
from unittest.mock import patch


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import db  # noqa: E402


class DatabaseBootstrapTests(unittest.TestCase):
    def test_bootstrap_creates_extension_before_registering_vector_type(self) -> None:
        events: list[str] = []

        class FakeCursor:
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return None

            def execute(self, sql: str) -> None:
                normalized = sql.strip().splitlines()[0]
                events.append(f"execute:{normalized}")

        class FakeConnection:
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return None

            def cursor(self) -> FakeCursor:
                return FakeCursor()

            def commit(self) -> None:
                events.append("commit")

        def register_fake_vector(_connection: FakeConnection) -> None:
            events.append("register_vector")

        with patch("app.db.psycopg.connect", return_value=FakeConnection()):
            with patch("app.db.register_vector", side_effect=register_fake_vector):
                db.bootstrap_database()

        self.assertEqual(
            events[:4],
            [
                "execute:CREATE EXTENSION IF NOT EXISTS vector;",
                "commit",
                "register_vector",
                "execute:CREATE SCHEMA IF NOT EXISTS vision;",
            ],
        )
        self.assertEqual(events[-1], "commit")


if __name__ == "__main__":
    unittest.main()
