// Fail-closed 2D landmark checks. A single image cannot prove movement, identity or clinical safety.
export const REQUIRED = ['left_shoulder','right_shoulder','left_hip','right_hip','left_knee','right_knee','left_ankle','right_ankle'];
export const NAMES = {11:'left_shoulder',12:'right_shoulder',13:'left_elbow',14:'right_elbow',15:'left_wrist',16:'right_wrist',23:'left_hip',24:'right_hip',25:'left_knee',26:'right_knee',27:'left_ankle',28:'right_ankle',29:'left_heel',30:'right_heel',31:'left_foot',32:'right_foot'};
export function angle(a,b,c) {
  if (![a,b,c].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y))) return null;
  const u=[a.x-b.x,a.y-b.y],v=[c.x-b.x,c.y-b.y];
  const d=Math.hypot(...u)*Math.hypot(...v);
  return d<1e-7?null:Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/d)))*180/Math.PI;
}
export function normalize(points) {
  if (!Array.isArray(points)) return {};
  return Object.fromEntries(Object.entries(NAMES).filter(([i])=>points[Number(i)]).map(([i,n])=>[n,points[Number(i)]]));
}
const good=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility===undefined||p.visibility>=0.55);
export function evaluate(description,points,previous=null,options={}) {
  const p=Array.isArray(points)?normalize(points):points||{};
  const prev=Array.isArray(previous)?normalize(previous):previous;
  const checks=[],add=(id,status,message)=>checks.push({id,status,message});
  if (!description||!description.trim()) add('description','UNCERTAIN','Δεν υπάρχει περιγραφή καρέ.');
  for (const name of REQUIRED) if(!good(p[name])) add('landmark_'+name,'UNCERTAIN','Δεν διακρίνεται αξιόπιστα: '+name);
  const kneeAngles=['left','right'].map(side=>angle(p[side+'_hip'],p[side+'_knee'],p[side+'_ankle']));
  const norm=description.toLocaleLowerCase('el-GR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const bend=/λυγισμεν|προβολη|lunge|squat|καθισμα/.test(norm);
  const upright=/ορθιο|τεντωμεν.*γον|ισια ποδια/.test(norm);
  if(bend) {
    if(kneeAngles.some(v=>v===null)) add('knee_bend','UNCERTAIN','Δεν μετρήθηκαν αξιόπιστα τα γόνατα.');
    else add('knee_bend',kneeAngles.some(v=>v<150)?'PASSED':'FAILED','Απαιτείται τουλάχιστον ένα λυγισμένο γόνατο (ενδεικτικό όριο 150°).');
  }
  if(upright) {
    if(kneeAngles.some(v=>v===null)) add('knee_extension','UNCERTAIN','Δεν μετρήθηκαν αξιόπιστα τα γόνατα.');
    else add('knee_extension',kneeAngles.every(v=>v>155)?'PASSED':'FAILED','Η όρθια στάση απαιτεί εκτεταμένα γόνατα (ενδεικτικό όριο 155°).');
  }
  if(prev) {
    const names=REQUIRED.filter(n=>good(p[n])&&good(prev[n]));
    if(names.length<6) add('transition','UNCERTAIN','Ανεπαρκή κοινά σημεία για σύγκριση.');
    else {
      const scale=Math.hypot(p.left_shoulder.x-p.right_shoulder.x,p.left_shoulder.y-p.right_shoulder.y);
      const d=names.reduce((sum,n)=>sum+Math.hypot(p[n].x-prev[n].x,p[n].y-prev[n].y),0)/names.length;
      if(scale<0.02) add('transition','UNCERTAIN','Μη αξιόπιστη κλίμακα σώματος.');
      else if(options.expectChange===true) add('transition',d/scale>0.075?'PASSED':'FAILED','Έλεγχος διαφοροποίησης στάσης από προηγούμενο καρέ.');
      else add('transition','UNCERTAIN','Δεν έχει δηλωθεί αν απαιτείται αλλαγή στάσης.');
    }
  }
  if(!bend&&!upright) add('semantic_coverage','UNCERTAIN','Η περιγραφή απαιτεί ειδικούς κινησιολογικούς κανόνες· δεν αρκεί η ανίχνευση σκελετού.');
  add('identity','UNCERTAIN','Τα landmarks δεν πιστοποιούν ταυτότητα, ρουχισμό, κάμερα ή φόντο.');
  const status=checks.some(c=>c.status==='FAILED')?'FAILED':checks.some(c=>c.status==='UNCERTAIN')?'UNCERTAIN':'PASSED';
  return {status,checks,kneeAngles,landmarks:p,automaticallyApproved:false};
}
export function correctionPrompt(description,result) {
 return 'Δημιούργησε ξανά την ίδια στάση. Περιγραφή: '+description+'\\nΔιόρθωσε: '+result.checks.filter(x=>x.status!=='PASSED').map(x=>x.message).join('; ')+'\\nΚράτησε το ίδιο μοντέλο, ρούχα, φόντο και γωνία κάμερας. Η εικόνα θα ελεγχθεί ξανά.';
}
