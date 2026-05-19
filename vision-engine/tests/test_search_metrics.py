from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from unittest.mock import patch


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.search_metrics import SearchMetricsCollector, _calculate_percentile  # noqa: E402


class SearchMetricsCollectorTests(unittest.TestCase):
    def test_calculate_percentile_returns_interpolated_value(self) -> None:
        values = [10.0, 20.0, 30.0, 40.0]

        self.assertEqual(_calculate_percentile(values, 0.50), 25.0)
        self.assertAlmostEqual(_calculate_percentile(values, 0.95), 38.5)
        self.assertAlmostEqual(_calculate_percentile(values, 0.99), 39.7)

    def test_collector_keeps_bounded_latency_window(self) -> None:
        collector = SearchMetricsCollector(window_size=3, persist_to_database=False)

        for value in [10.0, 20.0, 30.0, 40.0]:
            collector.record_request(
                status="accepted",
                search_latency_ms=value,
                encode_latency_ms=value / 2,
                db_query_latency_ms=value / 4,
            )

        snapshot = collector.snapshot()

        self.assertEqual(snapshot.total_requests, 4)
        self.assertAlmostEqual(snapshot.search_latency_p50_ms, 30.0)
        self.assertAlmostEqual(snapshot.search_latency_p95_ms, 39.0)
        self.assertAlmostEqual(snapshot.search_latency_p99_ms, 39.8)
        self.assertAlmostEqual(snapshot.encode_latency_p50_ms, 15.0)
        self.assertAlmostEqual(snapshot.db_query_latency_p50_ms, 7.5)

    def test_record_request_writes_database_event_best_effort(self) -> None:
        captured: dict[str, object] = {}

        class FakeCursor:
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return None

            def execute(self, sql, params):
                captured["sql"] = sql
                captured["params"] = params

        class FakeConnection:
            def cursor(self):
                return FakeCursor()

            def commit(self):
                captured["committed"] = True

        @contextmanager
        def fake_get_connection():
            yield FakeConnection()

        collector = SearchMetricsCollector(window_size=3)

        with patch("app.search_metrics.get_connection", fake_get_connection):
            collector.record_request(
                status="accepted",
                grouped_candidates=9,
                returned_candidates=5,
                threshold_filtered_count=4,
                top_score=0.91,
                score_floor=0.42,
                search_latency_ms=40.0,
                encode_latency_ms=20.0,
                db_query_latency_ms=10.0,
            )

        self.assertIn("vision.search_metric_events", captured["sql"])
        params = captured["params"]
        self.assertEqual(params[1], "accepted")
        self.assertEqual(params[3], 9)
        self.assertEqual(params[4], 5)
        self.assertEqual(params[5], 4)
        self.assertTrue(captured["committed"])

    def test_snapshot_aggregates_from_database_rows(self) -> None:
        created_at = datetime(2026, 5, 19, 12, 0, tzinfo=timezone.utc)
        aggregate = (
            3,
            1,
            1,
            1,
            0,
            0,
            0,
            0,
            7,
            12,
            8,
            0.76,
            4.0,
            2.6667,
            30.0,
            15.0,
            7.5,
        )
        latency_rows = [(10.0, 5.0, 2.5), (30.0, 15.0, 7.5), (50.0, 25.0, 12.5)]
        last = ("accepted", None, 0.91, 0.42, 50.0, 25.0, 12.5, created_at)
        empty_reason_rows = [("no_similar_images", 1)]

        class FakeCursor:
            def __init__(self) -> None:
                self.sql = ""

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return None

            def execute(self, sql, _params=None):
                self.sql = sql

            def fetchone(self):
                if "COUNT(*) AS total_requests" in self.sql:
                    return aggregate
                return last

            def fetchall(self):
                if "search_latency_ms IS NOT NULL" in self.sql:
                    return latency_rows
                return empty_reason_rows

        class FakeConnection:
            def cursor(self):
                return FakeCursor()

        @contextmanager
        def fake_get_connection():
            yield FakeConnection()

        collector = SearchMetricsCollector(window_size=3)

        with patch("app.search_metrics.get_connection", fake_get_connection):
            snapshot = collector.snapshot()

        self.assertEqual(snapshot.total_requests, 3)
        self.assertEqual(snapshot.accepted_requests, 1)
        self.assertEqual(snapshot.threshold_filtered_candidates, 7)
        self.assertEqual(snapshot.total_grouped_candidates, 12)
        self.assertAlmostEqual(snapshot.average_top_score or 0, 0.76)
        self.assertAlmostEqual(snapshot.search_latency_p50_ms, 30.0)
        self.assertEqual(snapshot.last_status, "accepted")
        self.assertEqual(snapshot.last_search_at, created_at)
        self.assertEqual(snapshot.empty_reason_counts["no_similar_images"], 1)


if __name__ == "__main__":
    unittest.main()
