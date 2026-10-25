import copy
import io
import json
import pathlib
import random
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image
import bulk_storyboards as bulk


def sheet(panels=6, width=1536):
    # Textured, separately identifiable cells with exact light panel dividers.
    rng = random.Random(20)
    image = Image.frombytes('RGB', (width, 300), rng.randbytes(width * 300 * 3))
    for n in range(1, panels):
        x = round(n * width / panels)
        image.paste((255, 255, 255), (x, 0, x + 1, 300))
    out = io.BytesIO()
    image.save(out, 'PNG')
    return out.getvalue()


class BulkTests(unittest.TestCase):
    def test_six_exact_crops_cover_entire_canvas_without_overlap(self):
        frames, boxes, info = bulk.split_storyboard(sheet())
        self.assertEqual(info['width'], 1536)
        self.assertEqual(boxes, [[i * 256, 0, (i+1) * 256, 300] for i in range(6)])
        self.assertEqual(len(set(bulk.digest(b) for b in frames)), 6)
        for frame in frames:
            self.assertEqual(Image.open(io.BytesIO(frame)).size, (256, 300))

    def test_five_panel_image_is_rejected_even_when_canvas_divides_by_six(self):
        with self.assertRaisesRegex(ValueError, 'Not the requested equal visible panels'):
            bulk.split_storyboard(sheet(panels=5))

    def test_nondivisible_width_is_padded_without_dropping_source_columns(self):
        frames, boxes, info = bulk.split_storyboard(sheet(width=1535))
        self.assertEqual(info['width'], 1535)
        self.assertEqual(info['splitWidth'], 1536)
        self.assertEqual(info['rightPaddingPixels'], 1)
        self.assertEqual(boxes[-1], [1280, 0, 1536, 300])

    def test_complex_sequence_can_have_ten_complete_frames(self):
        frames, boxes, info = bulk.split_storyboard(sheet(panels=10, width=2560), 10)
        self.assertEqual(len(frames), 10)
        self.assertEqual(boxes[-1], [2304, 0, 2560, 300])
        self.assertEqual(info['width'], 2560)

    def test_registration_preserves_old_phase_urls_and_reviews(self):
        with tempfile.TemporaryDirectory() as folder:
            root = pathlib.Path(folder)
            public = root / 'public'
            manifest = public / 'data/exercise-images.json'
            manifest.parent.mkdir(parents=True)
            before = {'version': 1, 'exercises': {'functional-001': {
                'status': 'pending_visual_review', 'phases': ['/old.webp'] * 4,
                'blockedPhases': {'2': 'historical reject'},
                'phaseReviews': {'2': {'status': 'rejected', 'notes': 'retain me'}}}}}
            manifest.write_text(json.dumps(before))
            job = {'exerciseId': 'functional-001', 'labels': [str(i) for i in range(6)],
                   'reference': '/ref.jpg', 'referenceSha256': 'a' * 64}
            with patch.multiple(bulk, ROOT=root, PUBLIC=public, MANIFEST=manifest):
                result = bulk.register(job, sheet(), 'test-batch', 'synthetic-test-fixture', True, manifest.read_bytes())
                after = json.loads(manifest.read_text())['exercises']['functional-001']
                self.assertEqual(after['phases'][:4], before['exercises']['functional-001']['phases'])
                self.assertEqual(after['phaseReviews'], before['exercises']['functional-001']['phaseReviews'])
                self.assertEqual(after['blockedPhases'], before['exercises']['functional-001']['blockedPhases'])
                self.assertFalse(after['storyboardPreview']['coachApproved'])
                self.assertTrue(all(c['url'] not in after['phases'] for c in after['importedCandidates']))
                self.assertEqual((public / result['sourceUrl'].lstrip('/')).read_bytes(), sheet())
                snapshot = manifest.read_bytes()
                with self.assertRaisesRegex(ValueError, 'already exists'):
                    bulk.register(job, sheet(), 'test-batch', 'synthetic-test-fixture', True, snapshot)
                self.assertEqual(manifest.read_bytes(), snapshot)
                after['phaseReviews']['1'] = {'status': 'approved'}
                manifest.write_text(json.dumps({'version': 1, 'exercises': {'functional-001': after}}))
                with self.assertRaisesRegex(ValueError, 'approved'):
                    bulk.register(job, sheet(), 'test-batch', 'synthetic-test-fixture', True, manifest.read_bytes())


if __name__ == '__main__':
    unittest.main()
