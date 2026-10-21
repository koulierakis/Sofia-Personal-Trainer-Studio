import argparse, io, json, pathlib, tempfile, threading, unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from PIL import Image
from comfy import run

class ComfyContractTest(unittest.TestCase):
    def test_http_submission_download_and_resume_without_duplicate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp);out=io.BytesIO();Image.effect_noise((512,512),50).convert('RGB').save(out,'PNG');image=out.getvalue();posts=[]
            class Handler(BaseHTTPRequestHandler):
                def log_message(self,*args): pass
                def do_GET(self):
                    data={'/system_stats':{},'/object_info':{'CLIPTextEncode':{},'SaveImage':{}},'/history/job':{'job':{'status':{'completed':True},'outputs':{'2':{'images':[{'filename':'one.png','subfolder':'','type':'output'}]}}}}}
                    b=image if self.path.startswith('/view?') else json.dumps(data[self.path]).encode();self.send_response(200);self.end_headers();self.wfile.write(b)
                def do_POST(self):
                    posts.append(json.loads(self.rfile.read(int(self.headers['Content-Length']))));self.send_response(200);self.end_headers();self.wfile.write(b'{"prompt_id":"job","node_errors":{}}')
            server=ThreadingHTTPServer(('127.0.0.1',0),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
            try:
                workflow=root/'workflow.json';workflow.write_text(json.dumps({'1':{'class_type':'CLIPTextEncode','inputs':{'text':'SOFIA_PROMPT'}},'2':{'class_type':'SaveImage','inputs':{}}}))
                queue=root/'queue.json';queue.write_text(json.dumps({'jobs':[{'exerciseId':'functional-031','phase':1,'action':'generate','specification':{'prompt':'Exact "quoted" cue'}}]}))
                args=argparse.Namespace(endpoint=f'http://127.0.0.1:{server.server_port}',workflow=workflow,queue=queue,output=str(root/'out'),limit=1,timeout=1,retry_failed=False)
                run(args);run(args)
                self.assertEqual(len(posts),1);self.assertEqual(posts[0]['prompt']['1']['inputs']['text'],'Exact "quoted" cue')
                mapping=json.loads((root/'out/mapping.json').read_text());self.assertEqual(mapping['images'][0]['mappingReview'],'pending');self.assertTrue((root/'out/export.zip').is_file())
            finally:server.shutdown();server.server_close();thread.join()
