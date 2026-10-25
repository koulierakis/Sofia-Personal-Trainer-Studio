import { Buffer } from 'node:buffer';
const MAX_BYTES=9*1024*1024;
const RATIOS=new Set(['1:1','16:9','9:16','4:5','3:2','21:9']);
const reply=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));};
export function imageEngineConfig(env=process.env){
  if(!env.SOFIA_IMAGE_ENGINE_URL)return {configured:false};
  const u=new URL(env.SOFIA_IMAGE_ENGINE_URL);
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash||u.pathname!=='/'||!['localhost','127.0.0.1','[::1]'].includes(u.hostname))throw Error('Invalid image engine URL');
  return {configured:true,base:u.origin};
}
export async function imageEngineHandler(req,res,env=process.env,fetcher=fetch){
  const route=req.url?.split('?')[0];
  if(!['/api/image-engine/status','/api/image-engine/generate'].includes(route))return false;
  let cfg;
  try{cfg=imageEngineConfig(env);}catch{reply(res,503,{success:false,error:'Invalid image engine configuration'});return true;}
  if(route==='/api/image-engine/status'){
    reply(res,req.method==='GET'?200:405,req.method==='GET'?{configured:cfg.configured,mode:'local-bridge',inferenceVerified:false}:{error:'Method not allowed'});return true;
  }
  if(req.method!=='POST'){reply(res,405,{error:'Method not allowed'});return true;}
  if(!cfg.configured){reply(res,503,{success:false,error:'Image engine not configured'});return true;}
  if(Number(req.headers?.['content-length']||0)>MAX_BYTES){reply(res,413,{error:'Request too large'});return true;}
  const chunks=[];let n=0;
  try{
    for await(const c of req){n+=c.length;if(n>MAX_BYTES){reply(res,413,{error:'Request too large'});return true;}chunks.push(c);}
    const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if(typeof input.prompt!=='string'||!input.prompt.trim()||input.prompt.length>4000){reply(res,400,{error:'Invalid prompt'});return true;}
    if(input.aspectRatio!==undefined&&!RATIOS.has(input.aspectRatio)){reply(res,400,{error:'Unsupported aspect ratio'});return true;}
    if(input.seed!==undefined&&(!Number.isSafeInteger(input.seed)||input.seed<0)){reply(res,400,{error:'Invalid seed'});return true;}
    if(input.referenceImage!==undefined&&(typeof input.referenceImage!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.referenceImage))){reply(res,400,{error:'Invalid reference image'});return true;}
    if(input.referenceStrength!==undefined&&(typeof input.referenceStrength!=='number'||!Number.isFinite(input.referenceStrength)||input.referenceStrength<0||input.referenceStrength>1)){reply(res,400,{error:'Invalid reference strength'});return true;}
    const payload={prompt:input.prompt.trim(),aspectRatio:input.aspectRatio||'1:1',...(input.seed!==undefined?{seed:input.seed}:{}),...(typeof input.negativePrompt==='string'?{negativePrompt:input.negativePrompt.slice(0,2000)}:{}),...(input.referenceImage?{referenceImage:input.referenceImage}:{}),...(input.referenceStrength!==undefined?{referenceStrength:input.referenceStrength}:{})};
    const upstream=await fetcher(cfg.base+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(120000)});
    if(!upstream.ok){reply(res,upstream.status===429?429:upstream.status===400?400:502,{success:false,error:upstream.status===429?'Provider rate limited':'Image engine rejected request',upstreamStatus:upstream.status});return true;}
    const result=await upstream.json(),uri=result?.record?.imageDataUri;
    if(result?.success!==true||typeof uri!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(uri)){reply(res,502,{success:false,error:'Upstream did not return an image data URI'});return true;}
    const bytes=Buffer.from(uri.split(',')[1],'base64');
    const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
    if(bytes.length<100||bytes.length>MAX_BYTES||!(jpg||png||webp)){reply(res,502,{success:false,error:'Invalid generated image bytes'});return true;}
    reply(res,200,{success:true,record:{id:result.record.id||null,imageDataUri:uri,imageUrl:result.record.imageUrl||null,provider:result.record.provider||null,model:result.record.model||null},fallbackChain:Array.isArray(result.fallbackChain)?result.fallbackChain:[]});
  }catch(e){reply(res,e instanceof SyntaxError?400:502,{success:false,error:e instanceof SyntaxError?'Invalid JSON':'Image engine unavailable'});}
  return true;
}
