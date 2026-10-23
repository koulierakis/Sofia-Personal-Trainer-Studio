import { imageEngineHandler } from './image-engine/bridge.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('.',import.meta.url)));
const publicRoot=join(root,'public');
const port=Number(process.env.PORT||3100);
const host=process.env.HOST||'127.0.0.1';
const mime={'.webp':'image/webp','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
http.createServer(async(req,res)=>{
  const send=(status,body,type='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);};
  try{
    const u=new URL(req.url,'http://localhost');
    if (await imageEngineHandler(req,res)) return;
    if(u.pathname==='/api/health')return send(200,JSON.stringify({ok:true,app:'Sofia',port}));
    if(req.method!=='GET'&&req.method!=='HEAD')return send(405,JSON.stringify({error:'Method not allowed'}));
    const relative=decodeURIComponent(u.pathname==='/'?'index.html':u.pathname.slice(1));
    if(relative.split(/[\\/]/).some(s=>!s||s==='.'||s==='..'||s.startsWith('.')))return send(403,JSON.stringify({error:'Forbidden'}));
    const path=resolve(publicRoot,relative);
    if(!path.startsWith(publicRoot+sep))return send(403,JSON.stringify({error:'Forbidden'}));
    const data=await readFile(path);
    send(200,req.method==='HEAD'?'':data,mime[extname(path)]||'application/octet-stream');
  }catch(e){send(e.code==='ENOENT'?404:500,JSON.stringify({error:e.code==='ENOENT'?'Not found':'Server error'}));}
}).listen(port,host,()=>console.log('Sofia Personal Trainer Studio http://localhost:'+port));

