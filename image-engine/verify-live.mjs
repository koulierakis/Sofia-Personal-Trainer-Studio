import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,extname} from 'node:path';
const base=process.env.SOFIA_URL||'http://127.0.0.1:3100';
const out=process.env.SOFIA_VERIFY_OUTPUT||join(process.cwd(),'live-verification');
const fixture=process.env.SOFIA_REFERENCE_IMAGE||join(process.cwd(),'reference.png');
async function call(route,options={}){
  const r=await fetch(base+route,{...options,redirect:'error',signal:AbortSignal.timeout(150000)});
  const text=await r.text();let data;
  try{data=JSON.parse(text);}catch{throw Error(route+': invalid JSON, HTTP '+r.status);}
  if(!r.ok)throw Error(route+': HTTP '+r.status+' '+JSON.stringify(data).slice(0,500));
  return data;
}
function image(uri){
  const m=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(uri||'');
  if(!m)throw Error('Missing or invalid image data URI');
  const b=Buffer.from(m[2],'base64'),kind=m[1];
  const valid=kind==='png'?b.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))&&b.toString('ascii',12,16)==='IHDR':kind==='jpeg'?b[0]===255&&b[1]===216&&b.at(-2)===255&&b.at(-1)===217:b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';
  if(!valid||b.length<100)throw Error('Invalid or empty image bytes');
  return {b,extension:kind==='jpeg'?'jpg':kind};
}
async function generate(label,payload){
  const result=await call('/api/image-engine/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if(result.success!==true)throw Error(label+': unsuccessful result');
  if(label==='output-image-to-image'&&result.record?.provider!=='gemini_imagen')throw Error('Image-to-Image cannot be verified: selected provider '+(result.record?.provider||'unknown')+' does not prove reference-image support in current generator');
  const {b,extension}=image(result.record?.imageDataUri),path=join(out,label+'.'+extension);
  await writeFile(path,b);
  console.log(label+': PASS, '+b.length+' bytes, '+path+', provider='+(result.record?.provider||'unknown'));
}
try{
  const status=await call('/api/image-engine/status');
  if(!status.configured)throw Error('Sofia bridge disabled; configure SOFIA_IMAGE_ENGINE_URL in Sofia server');
  const ref=await readFile(fixture);
  const ext=extname(fixture).toLowerCase();
  const mime=ext==='.jpg'||ext==='.jpeg'?'image/jpeg':ext==='.webp'?'image/webp':ext==='.png'?'image/png':null;
  if(!mime||ref.length<100||ref.length>4*1024*1024)throw Error('Reference must be a real PNG/JPEG/WebP (100B–4MB)');
  await mkdir(out,{recursive:true});
  await generate('output-text-to-image',{prompt:'A professional fitness trainer in a modern studio',aspectRatio:'1:1',seed:42});
  await generate('output-image-to-image',{prompt:'Transform this reference into a realistic professional fitness studio photograph',aspectRatio:'1:1',referenceImage:'data:'+mime+';base64,'+ref.toString('base64'),referenceStrength:0.6});
  console.log('LIVE VERIFICATION PASSED');
}catch(error){console.error('LIVE VERIFICATION FAILED:',error.message);process.exitCode=1;}
