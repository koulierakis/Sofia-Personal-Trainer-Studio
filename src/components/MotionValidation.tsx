import React,{useState,useRef,useEffect} from 'react';
// @ts-ignore JS validation module has no TS declarations
import {evaluate,correctionPrompt} from '../services/motion-validator.mjs';
declare global {interface Window {Pose?: any}}
type Frame={frame:number;poseDescription:string;changeFromPrevious?:string;label:string;sameImageAs?:number|null};
export const MotionValidation:React.FC<{frames:Frame[];exerciseId:string}>=({frames,exerciseId})=>{
 const [index,setIndex]=useState(0),[image,setImage]=useState(''),[result,setResult]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[attempts,setAttempts]=useState(0),[approved,setApproved]=useState(false);
 const canvas=useRef<HTMLCanvasElement>(null),img=useRef<HTMLImageElement>(null),previous=useRef<any>(null),pose=useRef<any>(null);
 useEffect(()=>{setIndex(0);setResult(null);setApproved(false);previous.current=null;setImage('');setAttempts(0)},[exerciseId]);
 useEffect(()=>()=>{if(image)URL.revokeObjectURL(image)},[image]);
 const load=async()=>{
  if(window.Pose)return;
  await new Promise<void>((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js';script.onload=()=>resolve();script.onerror=()=>reject(new Error('Αδυναμία φόρτωσης MediaPipe. Απαιτείται σύνδεση ή τοπική εγκατάσταση των assets.'));document.head.appendChild(script);
  });
 };
 const run=async()=>{
  if(!img.current||!canvas.current)return;
  setBusy(true);setError('');setResult(null);setApproved(false);
  try{
   await load();
   if(!pose.current){
    pose.current=new window.Pose({locateFile:(file:string)=>'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/'+file});
    pose.current.setOptions({modelComplexity:1,smoothLandmarks:false,minDetectionConfidence:0.6});
   }
   const detected=await new Promise<any>((resolve,reject)=>{
    const timeout=window.setTimeout(()=>reject(new Error('Λήξη χρόνου ανίχνευσης')),20000);
    pose.current.onResults((r:any)=>{clearTimeout(timeout);resolve(r)});
    pose.current.send({image:img.current}).catch((e:any)=>{clearTimeout(timeout);reject(e)});
   });
   const frame=frames[index],points=detected.poseLandmarks||[];
   const r=evaluate(frame.poseDescription,points,previous.current,{expectChange:index>0&&frame.sameImageAs!==1});
   const ctx=canvas.current.getContext('2d');
   canvas.current.width=img.current.naturalWidth;canvas.current.height=img.current.naturalHeight;
   if(ctx){ctx.drawImage(img.current,0,0);ctx.fillStyle='#22d3ee';for(const p of points){if(p.visibility>=0.55){ctx.beginPath();ctx.arc(p.x*canvas.current.width,p.y*canvas.current.height,Math.max(3,canvas.current.width/180),0,Math.PI*2);ctx.fill()}}}
   setResult(r);setAttempts(n=>n+1);
   // Only retain a prior frame when there are sufficient detected joints.
   if(points.length>=33&&r.checks.filter((c:any)=>c.id.startsWith('landmark_')).length===0)previous.current=points;
  }catch(e:any){setError(String(e?.message||e));setResult({status:'UNCERTAIN',checks:[{message:'Δεν ήταν δυνατή η ανίχνευση στάσης.'}]})}
  finally{setBusy(false)}
 };
 const next=(i:number)=>{setIndex(i);setResult(null);setApproved(false);setImage('')};
 const frame=frames[index];
 if(!frame)return null;
 return <section className="my-6 rounded-2xl border border-cyan-700 bg-slate-900 p-4 space-y-3" aria-label="Motion Validation">
  <h3 className="text-xl font-bold text-cyan-200">SOFIA MOTION VALIDATOR</h3>
  <p className="text-xs text-amber-200">Αυτόματος προέλεγχος 2D στάσης — όχι πιστοποίηση τεχνικής. Το MediaPipe φορτώνεται δωρεάν από CDN και απαιτεί internet.</p>
  <label className="block text-sm">Καρέ <select className="bg-slate-800 p-2" value={index} onChange={e=>next(Number(e.target.value))}>{frames.map((f,i)=><option key={i} value={i}>{i+1}. {f.label}</option>)}</select></label>
  <p className="text-sm text-white">{frame.poseDescription}</p>
  <p className="text-xs text-slate-300">Μετάβαση: {frame.changeFromPrevious||'Δεν έχει καθοριστεί'}</p>
  <input aria-label="Εικόνα καρέ" type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(image)URL.revokeObjectURL(image);setImage(URL.createObjectURL(f));setResult(null);setApproved(false)}}/>
  {image&&<img ref={img} src={image} alt="Εικόνα προς αξιολόγηση" onLoad={()=>setError('')} className="max-h-72 object-contain"/>}
  <canvas ref={canvas} className="max-w-full max-h-72" aria-label="Ανιχνευμένα σημεία σκελετού"/>
  <button type="button" disabled={!image||busy} onClick={run} className="p-2 rounded bg-cyan-800 disabled:opacity-40">{busy?'Ανίχνευση...':'Έλεγχος εικόνας'}</button>
  {error&&<p role="alert" className="text-rose-300">{error}</p>}
  {result&&<div className="space-y-2 text-sm">
   <strong className="block">Αυτόματος έλεγχος: {result.status} · Προσπάθειες: {attempts}</strong>
   <ul className="list-disc pl-5">{result.checks.map((c:any,i:number)=><li key={i}>{c.status||'UNCERTAIN'} — {c.message}</li>)}</ul>
   {result.kneeAngles&&<p>Γωνίες γονάτων: {result.kneeAngles.map((v:number|null)=>v===null?'άγνωστη':v.toFixed(1)+'°').join(' / ')}</p>}
   <button type="button" onClick={()=>navigator.clipboard?.writeText(correctionPrompt(frame.poseDescription,result))} className="p-2 rounded bg-slate-700">Αντιγραφή διορθωτικού prompt</button>
   <div className="flex gap-2">
    <button type="button" onClick={()=>setApproved(true)} className="p-2 rounded bg-emerald-800">Έγκριση προπονητή</button>
    <button type="button" onClick={()=>setApproved(false)} className="p-2 rounded bg-rose-800">Απόρριψη</button>
   </div>
   <p>{approved?'APPROVED — χειροκίνητη έγκριση μόνο για αυτή τη συνεδρία':'Δεν υπάρχει έγκριση. Η εικόνα δεν δημοσιεύεται αυτόματα.'}</p>
  </div>}
 </section>
};
