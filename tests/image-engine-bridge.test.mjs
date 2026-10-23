import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {imageEngineConfig,imageEngineHandler} from '../image-engine/bridge.mjs';
function req(method,url,body){const r=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);r.method=method;r.url=url;r.headers={};return r;}
function res(){return {status:0,body:null,writeHead(n){this.status=n;},end(s){this.body=JSON.parse(s);}};}
const env={SOFIA_IMAGE_ENGINE_URL:'http://127.0.0.1:3000'};
test('disabled by default',()=>assert.deepEqual(imageEngineConfig({}),{configured:false}));
test('reject remote URLs and credentials',()=>{for(const url of ['https://example.com/','http://user:pass@127.0.0.1/','file:///tmp/x'])assert.throws(()=>imageEngineConfig({SOFIA_IMAGE_ENGINE_URL:url}));});
test('status truthfully reports unverified inference',async()=>{const r=res();await imageEngineHandler(req('GET','/api/image-engine/status'),r,{});assert.equal(r.status,200);assert.equal(r.body.inferenceVerified,false);});
test('reject unsupported ratio before inference',async()=>{const r=res();await imageEngineHandler(req('POST','/api/image-engine/generate',{prompt:'hello',aspectRatio:'7:4'}),r,env,()=>{throw Error('must not call');});assert.equal(r.status,400);});
test('text-to-image forwards params and validates returned bytes',async()=>{let received;const jpeg=Buffer.concat([Buffer.from([255,216,255]),Buffer.alloc(200)]).toString('base64');const fetcher=async(url,opts)=>{received={url,payload:JSON.parse(opts.body)};return {ok:true,json:async()=>({success:true,record:{id:'x',imageDataUri:'data:image/jpeg;base64,'+jpeg,provider:'test'}})};};const r=res();await imageEngineHandler(req('POST','/api/image-engine/generate',{prompt:'  squat  ',aspectRatio:'16:9',seed:42}),r,env,fetcher);assert.equal(r.status,200);assert.equal(r.body.success,true);assert.equal(received.url,'http://127.0.0.1:3000/api/generate');assert.equal(received.payload.prompt,'squat');assert.equal(received.payload.seed,42);});
test('image-to-image forwards reference and strength',async()=>{let payload;const fetcher=async(_,opts)=>{payload=JSON.parse(opts.body);return {ok:false,status:429};};const r=res();await imageEngineHandler(req('POST','/api/image-engine/generate',{prompt:'change pose',referenceImage:'data:image/png;base64,aGVsbG8=',referenceStrength:0.5}),r,env,fetcher);assert.equal(payload.referenceStrength,0.5);assert.equal(payload.referenceImage,'data:image/png;base64,aGVsbG8=');assert.equal(r.status,429);});
test('reject fake success without image',async()=>{const r=res();await imageEngineHandler(req('POST','/api/image-engine/generate',{prompt:'test'}),r,env,async()=>({ok:true,json:async()=>({success:true,record:{imageUrl:'/generated/fake.jpg'}})}));assert.equal(r.status,502);});
