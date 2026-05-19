from __future__ import annotations

from io import BytesIO
from pathlib import Path
import inspect
import sys
import unittest
from unittest.mock import Mock, patch
from uuid import uuid4

from fastapi import HTTPException


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import main  # noqa: E402
from app.models import SearchCandidate  # noqa: E402
from app.search_service import SearchExecutionResult  # noqa: E402


class MainApiTests(unittest.TestCase):
    def test_index_info_requires_internal_secret(self) -> None:
        with patch.object(main.settings, "vision_internal_secret", "secret"):
            with self.assertRaises(HTTPException) as missing:
                main.index_info(x_vision_internal_secret=None)
            with self.assertRaises(HTTPException) as invalid:
                main.index_info(x_vision_internal_secret="wrong")

        self.assertEqual(missing.exception.status_code, 403)
        self.assertEqual(invalid.exception.status_code, 403)

    def test_index_info_accepts_valid_internal_secret(self) -> None:
        original_clip_service = main.clip_service
        original_image_search_service = main.image_search_service
        search_service = Mock()
        search_service.load_index_info.return_value = {
            "active_image_count": 12,
            "active_product_count": 5,
            "index_version": "sync-token",
        }

        try:
            main.clip_service = object()
            main.image_search_service = search_service
            with patch.object(main.settings, "vision_internal_secret", "secret"):
                response = main.index_info(x_vision_internal_secret="secret")
        finally:
            main.clip_service = original_clip_service
            main.image_search_service = original_image_search_service

        self.assertTrue(response.ready)
        self.assertEqual(response.active_image_count, 12)
        self.assertEqual(response.active_product_count, 5)
        self.assertEqual(response.index_version, "sync-token")

    def test_search_image_is_sync_route_and_reads_upload_file(self) -> None:
        payload = b"image-bytes"
        product_id = uuid4()
        search_service = Mock()
        search_service.search_bytes.return_value = SearchExecutionResult(
            candidates=[
                SearchCandidate(
                    backend_product_id=product_id,
                    score=0.91,
                    matched_image_url="https://example.com/product.jpg",
                    matched_image_index=0,
                    is_primary=True,
                )
            ],
            grouped_candidate_count=1,
            threshold_filtered_count=0,
            top_score=0.91,
            score_floor=0.42,
            status="accepted",
            empty_reason=None,
            index_version="sync-token",
            search_latency_ms=40.0,
            encode_latency_ms=20.0,
            db_query_latency_ms=10.0,
        )
        fake_metrics = Mock()
        fake_upload = Mock()
        fake_upload.content_type = "image/png"
        fake_upload.file = BytesIO(payload)

        original_image_search_service = main.image_search_service
        original_search_metrics = main.search_metrics
        try:
            main.image_search_service = search_service
            main.search_metrics = fake_metrics
            with patch.object(main.settings, "vision_internal_secret", "secret"):
                response = main.search_image(
                    file=fake_upload,
                    limit=10,
                    category_slug=None,
                    store_slug=None,
                    x_vision_internal_secret="secret",
                )
        finally:
            main.image_search_service = original_image_search_service
            main.search_metrics = original_search_metrics

        self.assertFalse(inspect.iscoroutinefunction(main.search_image))
        self.assertEqual(response.total_candidates, 1)
        self.assertEqual(response.candidates[0].backend_product_id, product_id)
        self.assertEqual(search_service.search_bytes.call_args.kwargs["payload"], payload)
        fake_metrics.record_request.assert_called_once()


if __name__ == "__main__":
    unittest.main()
