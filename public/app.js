import {buildOriginalConcepts} from './advanced-catalog.js';
import {ensureVisualization} from './visualization-sequence.js';
import {REVIEW_KEY,sanitizeReviews,reviewConcept,reviewStatus,visibleConcepts,reviewCounts} from './review-system.js';
const $=id=>document.getElementById(id);
const STORE='sofia_personal_trainer_v3',KEYS=['Αρχική','Μεσαία','Επόμενη','Επιστροφή'];
let state={exercises:[],programs:[]},mode=null,tab='exercises',limit=20,selected=null,showConcepts=true;
let base={exercises:[],programs:[]};
const conceptExercises=buildOriginalConcepts();
let reviews={};try{reviews=sanitizeReviews(JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}'));}catch{reviews={};}
let queueOnly=false;
function saveReviews(next){try{localStorage.setItem(REVIEW_KEY,JSON.stringify(next));reviews=next;return true;}catch(e){msg('Αποτυχία αποθήκευσης αξιολόγησης: '+e.message);return false;}}
function changeReview(id,status){stopExercisePlayer();const next=reviewConcept(id,status,reviews);if(!saveReviews(next))return;$('studio').classList.remove('detail-open');selected=null;render();msg(status==='approved'?'Εγκρίθηκε η άσκηση και οι περιγραφές των καρέ.':'Απορρίφθηκε η άσκηση και αφαιρέθηκε από τον κατάλογο αυτού του browser.');}

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('el-GR');
const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=String(value??'');if(cls)el.className=cls;return el;};
const button=(title,fn)=>{const b=text('button',title);b.addEventListener('click',fn);return b;};
const msg=s=>$('notice').textContent=s;
function load(){try{const raw=JSON.parse(localStorage.getItem(STORE)||'null');if(raw&&Array.isArray(raw.exercises)&&Array.isArray(raw.programs))state=raw;}catch{msg('Πρόβλημα ανάγνωσης τοπικών δεδομένων.');}}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));return true;}catch(e){msg('Αδυναμία αποθήκευσης: '+e.message+' · Εξαγάγετε αντίγραφο και ελέγξτε τη χωρητικότητα.');return false;}}
const name=x=>x.name||x.title||x.gr||'Άσκηση χωρίς τίτλο';
const savedExercises=()=>{const items=new Map(base.exercises.map(x=>[x.id,x]));for(const x of state.exercises)items.set(x.id,{...items.get(x.id),...x});return [...items.values()].filter(x=>!x.requiresCoachReview||reviewStatus(x.id,reviews)!=='rejected').map(x=>x.requiresCoachReview?{...x,reviewStatus:reviewStatus(x.id,reviews),requiresCoachReview:reviewStatus(x.id,reviews)!=='approved'}:x);};
const savedPrograms=()=>{const items=new Map(base.programs.map(x=>[x.id,x]));for(const p of state.programs)items.set(p.id,{...items.get(p.id),...p});return [...items.values()];};
const catalog=()=>{const saved=savedExercises();if(mode!=='functional')return saved;if(queueOnly)return [...saved.filter(x=>x.custom&&x.reviewStatus==='pending'),...visibleConcepts(conceptExercises,reviews,true).filter(x=>x.reviewStatus==='pending')];return [...saved.filter(x=>!x.custom||showConcepts),...visibleConcepts(conceptExercises,reviews,showConcepts)];};
const equipment=x=>Array.isArray(x.equipment)?x.equipment:(x.equipment?[x.equipment]:[]);
const muscles=x=>[...(Array.isArray(x.muscles)?x.muscles:[]),...(Array.isArray(x.primaryMuscles)?x.primaryMuscles:[]),...(Array.isArray(x.detailedMuscles)?x.detailedMuscles:[])].filter(Boolean);
const discipline=x=>x.discipline==='pilates'||x.trainingType==='reformer'?'pilates':'functional';
function openMode(next){stopExercisePlayer();$('studio').classList.remove('detail-open');selected=null;mode=next;tab='exercises';$('welcome').hidden=true;$('studio').hidden=false;$('back').hidden=false;$('studioTitle').textContent=next==='functional'?'Functional Training':'Pilates';$('query').value='';$('level').value='';limit=20;render();}
document.querySelectorAll('[data-mode]').forEach(x=>x.addEventListener('click',()=>openMode(x.dataset.mode)));
$('back').onclick=()=>{stopExercisePlayer();$('studio').classList.remove('detail-open');selected=null;$('studio').hidden=true;$('welcome').hidden=false;$('back').hidden=true;mode=null;};
document.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{tab=x.dataset.tab;limit=20;render();});
function filtered(){const q=norm($('query').value.trim()),level=$('level').value,muscle=$('muscle').value,eq=$('equipment').value;return catalog().filter(x=>discipline(x)===mode&&(!level||x.level===level)&&(!eq||equipment(x).includes(eq))&&(!muscle||muscles(x).includes(muscle)||x.category===muscle)&&(!q||norm([name(x),x.category,x.instructions,...muscles(x),...equipment(x)].join(' ')).includes(q))&&(tab!=='stretches'||/stretch|mobility|διατα|κινητικο/.test(norm([x.category,x.name,x.goal,x.discipline].join(' ')))));}
function filters(){const list=catalog().filter(x=>discipline(x)===mode);for(const [id,values] of [['muscle',list.flatMap(x=>[...muscles(x),x.category].filter(Boolean))],['equipment',list.flatMap(equipment)]]){const e=$(id),old=e.value,first=e.options[0].text;e.replaceChildren(new Option(first,''));[...new Set(values)].sort((a,b)=>a.localeCompare(b,'el')).forEach(x=>e.add(new Option(x,x)));if([...e.options].some(o=>o.value===old))e.value=old;}}
for(const id of ['query','muscle','equipment','level'])$(id).addEventListener(id==='query'?'input':'change',()=>{limit=20;renderCards();});
function renderCards(){const arr=filtered(),target=$('cards');target.replaceChildren();$('count').textContent=arr.length+' αποτελέσματα · '+catalog().filter(x=>discipline(x)===mode).length+' στη βιβλιοθήκη';for(const x of arr.slice(0,limit)){const card=text('article','','card');card.append(text('span',x.custom?'CUSTOM · ADVANCED':(x.requiresCoachReview?'ΥΠΟ ΑΞΙΟΛΟΓΗΣΗ':(x.level||'—')),'badge'),text('h3',name(x)),text('p',(x.custom?(x.category||'Full Body')+' · ':'')+(equipment(x).join(' · ')||'Βάρος σώματος')));if(x.custom&&x.requiresCoachReview)card.append(text('small','Υπό αξιολόγηση προπονητή','warning'));card.append(button('Προβολή άσκησης',()=>viewExercise(x)));target.append(card);}if(arr.length>limit)target.append(button('Περισσότερες ασκήσεις',()=>{limit+=20;renderCards();}));if(!arr.length)target.append(text('p','Δεν βρέθηκαν ασκήσεις. Αλλάξτε κριτήρια ή εισαγάγετε αρχείο JSON.'));if(!selected)$('detail').hidden=true;}


let exercisePlayerCleanup=()=>{};
function stopExercisePlayer(){exercisePlayerCleanup();exercisePlayerCleanup=()=>{};}

function viewExercise(x){
 x=ensureVisualization(x);stopExercisePlayer();selected=x.id;$('studio').classList.add('detail-open');
 const d=$('detail');
 d.replaceChildren(text('h2',name(x)),text('p',(x.custom?'Custom · ':'')+(x.level||'')+' · '+(x.category||'Functional')),
  text('h3','Περιγραφή άσκησης'),text('p',x.instructions||x.description||'Δεν υπάρχει ακόμη περιγραφή.'),
  text('h3','Μυϊκές ομάδες'),text('p',muscles(x).join(', ')),
  text('h3','Αναπνοή'),text('p',x.breathing||'Δεν έχει καταχωριστεί.'),
  text('h3','Προφυλάξεις'),text('p',x.safety||'Δεν έχουν καταχωριστεί.'));
 if(x.requiresCoachReview)d.append(text('p','Πρόταση υπό αξιολόγηση προπονητή.','warning'));
 if(x.custom||x.newConcept){
  const status=reviewStatus(x.id,reviews),actions=text('div','','exercise-review-actions');
  actions.append(text('p',status==='approved'?'Η άσκηση έχει εγκριθεί.':'Αξιολόγηση άσκησης και περιγραφών καρέ.','muted'));
  if(status!=='approved')actions.append(button('✓ Έγκριση άσκησης',()=>changeReview(x.id,'approved')));
  if(status!=='rejected')actions.append(button('× Απόρριψη άσκησης',()=>{if(confirm('Να απορριφθεί ολόκληρη η άσκηση και οι περιγραφές των καρέ;'))changeReview(x.id,'rejected');}));
  d.append(actions);
 }
 renderPrompts(d,x);
 d.prepend(button('← Επιστροφή στις ασκήσεις',()=>{stopExercisePlayer();selected=null;$('studio').classList.remove('detail-open');d.hidden=true;window.scrollTo({top:0,behavior:'instant'});}));
 d.hidden=false;window.scrollTo({top:0,behavior:'instant'});
}
function renderPrompts(target,exercise){
 const sequence=ensureVisualization(exercise).visualization;
 const section=text('section','','visualization-sequence');
 section.append(text('h3','Οπτικοποίηση με περιγραφή καρέ · '+sequence.frameCount+' καρέ'),
  text('p',sequence.fixedVisualContext,'muted'),
  text('p','Κλειδωμένη αναφορά μοντέλου/φόντου: '+sequence.referenceImage+' · SHA-256 '+sequence.referenceSha256,'warning'),
  text('p',sequence.promptTemplate,'muted'),
  text('p','Δεν εμφανίζονται ή αποθηκεύονται φωτογραφίες εκτέλεσης. Κάθε εργαλείο εικόνας χρησιμοποιεί το γραπτό prompt κάθε καρέ και την εγκεκριμένη φωτογραφία αναφοράς. Το τελευταίο καρέ επαναχρησιμοποιεί την αρχική εικόνα.','muted'));
 for(const frame of sequence.frames){
  const details=document.createElement('details'),summary=text('summary','Frame '+frame.frame+' — '+frame.label);
  details.append(summary,text('p','Στάση σώματος: '+frame.poseDescription),text('p','Μετάβαση: '+frame.transitionDescription));
  if(frame.sameImageAs)details.append(text('p','Δεν παράγεται νέα εικόνα. Χρησιμοποιείται αυτούσια η εικόνα του Frame '+frame.sameImageAs+'.','warning'));
  const promptDetails=document.createElement('details');promptDetails.append(text('summary','Πλήρες prompt για το AI'),text('p',frame.prompt));details.append(promptDetails);section.append(details);
 }
 const exportButton=button('Λήψη prompts όλων των καρέ',()=>{
  const lines=[sequence.promptTemplate,...sequence.frames.map(frame=>'FRAME '+frame.frame+' — '+frame.label+'\n'+frame.prompt)].join('\n\n');
  const blob=new Blob([lines],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=(exercise.id||'exercise').replace(/^hybrid-/,'custom-')+'-visualization-frames.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
 });
 section.append(exportButton);target.append(section);
}
function renderPrograms(){const g=$('programCards');g.replaceChildren();const list=savedPrograms().filter(p=>(p.discipline||'functional')===mode);for(const p of list){const c=text('article','','card');c.append(text('h3',p.name||p.title||p.id),text('p',(p.level||'')+' · '+(p.durationMinutes||((p.blocks||[]).reduce((a,b)=>a+Number(b.minutes||0),0)))+' λεπτά'));c.append(button('Προβολή προγράμματος',()=>{const d=$('programDetail');d.replaceChildren(text('h2',p.name||p.title||p.id));const ol=document.createElement('ol');for(const b of p.blocks||[]){const li=text('li',b.minutes+'′ — '+b.activity);const id=b.activity.match(/\bfunctional-\d{3}\b/)?.[0];const exercise=id?savedExercises().find(x=>x.id===id):null;if(exercise)li.append(button('Προβολή άσκησης και περιγραφών καρέ',()=>{tab='exercises';render();viewExercise(exercise)}));ol.append(li);}d.append(ol);d.hidden=false;d.scrollIntoView({behavior:'smooth'});}));g.append(c);}if(!list.length)g.append(text('p','Δεν υπάρχουν αποθηκευμένα προγράμματα σε αυτή την ενότητα.'));}
function render(){const queueToggle=$('queueOnly');if(queueToggle){queueToggle.closest('label').hidden=mode!=='functional';queueToggle.checked=queueOnly;}const conceptsToggle=$('concepts');if(conceptsToggle){conceptsToggle.closest('label').hidden=mode!=='functional';conceptsToggle.checked=showConcepts;}const rc=$('reviewCounts');if(rc){const allCustom=[...conceptExercises,...base.exercises.filter(x=>x.custom)];const a=reviewCounts(allCustom,reviews);rc.hidden=mode!=='functional'||a.pending===0;rc.textContent='Custom ασκήσεις: '+a.pending+' σε αναμονή · '+a.approved+' εγκεκριμένες · '+a.rejected+' απορρίφθηκαν';}document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('selected',x.dataset.tab===tab));$('searchPanel').hidden=tab!=='exercises'&&tab!=='stretches';$('results').hidden=tab!=='exercises'&&tab!=='stretches';$('programPanel').hidden=tab!=='programs';$('dataPanel').hidden=tab!=='data';if(tab==='exercises'||tab==='stretches'){filters();renderCards();}else if(tab==='programs')renderPrograms();}
function validate(data){if(!data||!Array.isArray(data.exercises)||!Array.isArray(data.programs))throw Error('Το JSON πρέπει να περιέχει πίνακες exercises και programs.');const exerciseIds=new Set(),programIds=new Set();for(const x of data.exercises){if(!x||typeof x.id!=='string'||!x.id.trim()||!(typeof (x.name||x.title||x.gr)==='string'&&(x.name||x.title||x.gr).trim())||exerciseIds.has(x.id))throw Error('Άκυρο ή διπλό ID άσκησης: '+x?.id);exerciseIds.add(x.id);}for(const p of data.programs){if(!p||typeof p.id!=='string'||!p.id.trim()||programIds.has(p.id)||!Array.isArray(p.blocks))throw Error('Άκυρο πρόγραμμα: '+p?.id);if(p.blocks.some(b=>!b||typeof b.activity!=='string'||!b.activity.trim()||!Number.isFinite(Number(b.minutes))||Number(b.minutes)<=0))throw Error('Μη έγκυρο τμήμα προγράμματος '+p.id);const minutes=p.blocks.reduce((a,b)=>a+Number(b.minutes||0),0);if(Math.abs(minutes-60)>0.001)throw Error('Το πρόγραμμα '+p.id+' δεν είναι 60 λεπτών.');programIds.add(p.id);}return {...data,exercises:data.exercises.map(ensureVisualization)};}
$('import').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=validate(JSON.parse(await file.text()));if(data.sofiaReviews){const imported=sanitizeReviews(data.sofiaReviews);if(!saveReviews({...reviews,...imported}))return;}const ex=new Map(state.exercises.map(x=>[x.id,x])),pr=new Map(state.programs.map(x=>[x.id,x]));for(const x of data.exercises)ex.set(x.id,{...ex.get(x.id),...x});for(const p of data.programs)pr.set(p.id,{...pr.get(p.id),...p});const previous=state;state={exercises:[...ex.values()],programs:[...pr.values()]};if(!save()){state=previous;return;}msg('Εισήχθησαν '+data.exercises.length+' ασκήσεις και '+data.programs.length+' προγράμματα, με συγχώνευση IDs.');render();}catch(err){msg('Η εισαγωγή ακυρώθηκε: '+err.message);}finally{e.target.value='';}};
$('export').onclick=()=>{const b=new Blob([JSON.stringify({schemaVersion:4,exercises:savedExercises(),programs:savedPrograms(),sofiaReviews:reviews},null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='Sofia_Backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
$('voice').onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){msg('Η φωνητική αναγνώριση δεν υποστηρίζεται εδώ. Δοκίμασε Chrome σε ασφαλές περιβάλλον HTTPS ή πληκτρολόγησε.');return;}if(!mode)openMode('functional');const r=new R();r.lang='el-GR';r.onresult=e=>{const speech=e.results[0][0].transcript,spoken=norm(speech);const match=spoken.match(/\b(\d+)\b/),n=match?Math.min(100,Number(match[1])):20;const levels=[['advanced','Advanced'],['προχωρημεν','Advanced'],['intermediate','Intermediate'],['beginner','Beginner'],['αρχαρι','Beginner']];$('level').value=levels.find(([word])=>spoken.includes(word))?.[1]||'';let group='';for(const g of ['Πόδια & Γλουτοί','Πλάτη','Ώμοι','Κορμός','Στήθος']){if((g==='Πόδια & Γλουτοί'&&/ποδ|γλουτ/.test(spoken))||(g==='Πλάτη'&&/πλατ/.test(spoken))||(g==='Ώμοι'&&/ωμ/.test(spoken))||(g==='Κορμός'&&/κορμ|κοιλ/.test(spoken))||(g==='Στήθος'&&/στηθ/.test(spoken))){group=g;break;}}$('muscle').value=[...$('muscle').options].some(o=>o.value===group)?group:'';for(const eq of [...$('equipment').options].map(o=>o.value).filter(Boolean)){if(spoken.includes(norm(eq))){$('equipment').value=eq;break;}}$('query').value='';tab='exercises';limit=n;render();msg('Φωνητική αναζήτηση: '+speech+' · αποτελέσματα από την τοπική βιβλιοθήκη.');};r.onerror=e=>msg('Σφάλμα μικροφώνου: '+e.error);try{r.start();}catch(e){msg('Αδυναμία χρήσης μικροφώνου: '+e.message);}};
$('queueOnly').addEventListener('change',e=>{queueOnly=Boolean(e.target.checked);limit=20;tab='exercises';render();});
$('concepts').addEventListener('change',e=>{showConcepts=Boolean(e.target.checked);limit=20;render();msg(showConcepts?'Οι custom ασκήσεις εμφανίζονται ως προχωρημένες προτάσεις και απαιτούν αξιολόγηση προπονητή.':'Εμφανίζονται μόνο αποθηκευμένες ασκήσεις.');});
load();
async function loadBuiltIn(){
  const paths=['functional-01.json','functional-02.json','functional-03.json','functional-04.json','functional-programs.json'];
  try{
    const data=await Promise.all(paths.map(async path=>{
      const response=await fetch('/data/'+path,{cache:'no-cache'});
      if(!response.ok)throw Error(path+' HTTP '+response.status);
      return response.json();
    }));
    if(data.slice(0,4).some(x=>!Array.isArray(x)||x.length!==25)||!Array.isArray(data[4])||data[4].length!==10)throw Error('Μη αναμενόμενος αριθμός εγγραφών');
    const originalResponse=await fetch('/data/custom-sequences.json',{cache:'no-cache'});
    const originalExercises=originalResponse.ok?await originalResponse.json():[];
    if(!Array.isArray(originalExercises))throw Error('Μη έγκυρη νέα βιβλιοθήκη');
    const exercises=data.slice(0,4).flat(),programs=data[4];
    const ids=new Set(exercises.map(x=>x.id));
    if(ids.size!==100||programs.some(p=>p.blocks.reduce((s,b)=>s+Number(b.minutes||0),0)!==60))throw Error('Μη έγκυρα αρχικά δεδομένα');
    base={exercises:[...exercises,...originalExercises],programs};
    if(mode)render();
    msg('Φορτώθηκαν 100 κανονικές ασκήσεις, '+(originalExercises.length+conceptExercises.length)+' Custom ασκήσεις και τα 10 προγράμματα των 60 λεπτών.');
  }catch(e){msg('Σφάλμα φόρτωσης αρχικής βιβλιοθήκης: '+e.message+' — δοκίμασε ανανέωση.');}
}
void loadBuiltIn();



