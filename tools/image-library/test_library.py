import io, json, pathlib, tempfile, unittest, zipfile
from unittest.mock import patch
from PIL import Image
import library
from comfy import workflow_validate

class IntakeTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.root=pathlib.Path(self.tmp.name);public=self.root/'public';self.assets=public/'images/exercises';self.assets.mkdir(parents=True);self.manifest=public/'data/exercise-images.json';library.write(self.manifest,{'version':1,'exercises':{}})
        for name,value in [('ROOT',self.root),('PUBLIC',public),('MANIFEST',self.manifest)]:
            p=patch.object(library,name,value);p.start();self.addCleanup(p.stop)
        p=patch.object(library,'catalog',return_value={'functional-001':{'productionFrames':[{}, {}, {}, {}]}});p.start();self.addCleanup(p.stop)
        im=Image.effect_noise((512,512),70).convert('RGB');b=io.BytesIO();im.save(b,'PNG');self.b=b.getvalue();self.source=self.root/'source';self.source.mkdir();(self.source/'frame.png').write_bytes(self.b)
        self.row={'file':'frame.png','sha256':library.digest(self.b),'sofiaExerciseId':'functional-001','sofiaPhase':1,'sourceExerciseId':'kinesio-947','sourcePhase':'start','provider':'KinesioForge','mappingReview':'approved','mappingReviewer':'Fixture reviewer'};self.mapping=self.root/'mapping.json';self.save()
    def save(self): library.write(self.mapping,{'version':1,'images':[self.row]})
    def test_real_directory_import_is_candidate_only_and_duplicate_safe(self):
        self.assertEqual(library.import_export(self.source,self.mapping,True),1);self.assertEqual(list(self.assets.rglob('*.webp')),[])
        self.assertEqual(library.import_export(self.source,self.mapping),1)
        e=library.read(self.manifest)['exercises']['functional-001'];self.assertEqual(e['phases'],[None]*4);self.assertEqual(e['importedCandidates'][0]['sourceExerciseId'],'kinesio-947')
        with self.assertRaisesRegex(ValueError,'Duplicate'):library.import_export(self.source,self.mapping)
    def test_zip_import(self):
        z=self.root/'export.zip'
        with zipfile.ZipFile(z,'w') as f:f.writestr('frame.png',self.b)
        self.assertEqual(library.import_export(z,self.mapping),1)
    def test_zip_traversal_rejected(self):
        z=self.root/'export.zip'
        with zipfile.ZipFile(z,'w') as f:f.writestr('../frame.png',self.b)
        with self.assertRaisesRegex(ValueError,'Unsafe'):library.import_export(z,self.mapping)
    def test_hash_and_identity_review_and_phase_enforced(self):
        for key,value in [('sha256','wrong'),('sofiaExerciseId','functional-999'),('sofiaPhase',0),('mappingReview','pending'),('file','../frame.png')]:
            old=self.row[key];self.row[key]=value;self.save()
            with self.assertRaises(ValueError):library.import_export(self.source,self.mapping)
            self.assertEqual(list(self.assets.rglob('*.webp')),[]);self.row[key]=old
    def test_entire_batch_prevalidated(self):
        bad={**self.row,'sofiaPhase':2,'sha256':'bad'};library.write(self.mapping,{'version':1,'images':[self.row,bad]})
        before=self.manifest.read_bytes()
        with self.assertRaises(ValueError):library.import_export(self.source,self.mapping)
        self.assertEqual(before,self.manifest.read_bytes());self.assertEqual(list(self.assets.rglob('*.webp')),[])
    def test_binary_blank_and_dimension_rejected(self):
        for b in [b'not image',b'RIFF0000WEBPgarbage']:
            with self.assertRaises(Exception):library.inspect(b)
        b=io.BytesIO();Image.new('RGB',(512,512),'white').save(b,'PNG')
        with self.assertRaisesRegex(ValueError,'Blank'):library.inspect(b.getvalue())
    def test_workflow_validation(self):
        with self.assertRaises(ValueError):workflow_validate({'nodes':[]},{})
        with self.assertRaises(ValueError):workflow_validate({'1':{'class_type':'Unknown','inputs':{}}},{})
        workflow_validate({'1':{'class_type':'SaveImage','inputs':{}}},{'SaveImage':{}})

if __name__=='__main__': unittest.main()

class ReviewTests(unittest.TestCase):
    setUp=IntakeTests.setUp
    save=IntakeTests.save
    def test_hash_bound_review_and_protection(self):
        import review
        for name in ['ROOT','MANIFEST']:
            p=patch.object(review,name,getattr(library,name));p.start();self.addCleanup(p.stop)
        library.import_export(self.source,self.mapping)
        m=library.read(self.manifest);url=m['exercises']['functional-001']['importedCandidates'][0]['url']
        review.review('functional-001',1,url,'approved','Test fixture coach','Fixture-only assessment')
        e=library.read(self.manifest)['exercises']['functional-001'];self.assertEqual(e['phases'][0],url);self.assertEqual(e['phaseReviews']['1']['sha256'],library.digest(library.local_url(url).read_bytes()))
        with self.assertRaises(ValueError):review.review('functional-001',2,url,'approved','Test fixture','Wrong phase')
        review.review('functional-001',1,url,'rejected','Test fixture coach','Fixture rejection')
        e=library.read(self.manifest)['exercises']['functional-001'];self.assertIsNone(e['phases'][0]);self.assertTrue(library.local_url(url).is_file())
