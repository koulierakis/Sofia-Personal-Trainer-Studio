import {loadImageLibrary,imageFor,setImageReview,playerImageEntry} from './exercise-image-library.js';
import {getFrame,setFrame,approveFrame,rejectFrame} from './image-review-store.js';
import {originalAdvancedFrames} from './original-visual-storyboards.js';
import {buildOriginalConcepts} from './advanced-catalog.js';
import {exerciseStoryboard} from './storyboard-prompts.js';
import {REVIEW_KEY,sanitizeReviews,reviewConcept,reviewStatus,visibleConcepts,reviewCounts} from './review-system.js';
const $=id=>document.getElementById(id);
const STORE='sofia_personal_trainer_v3',KEYS=['Αρχική','Μεσαία','Επόμενη','Επιστροφή'];
let imageLibrary={};
let state={exercises:[],programs:[]},mode=null,tab='exercises',limit=20,selected=null,showConcepts=true;
let base={exercises:[],programs:[]};
const conceptExercises=buildOriginalConcepts();
let reviews={};try{reviews=sanitizeReviews(JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}'));}catch{reviews={};}
let queueOnly=false;
let catalogRevealed=false;
function hasActiveExerciseFilters(){
  return Boolean($('query')?.value.trim() || $('muscle')?.value || $('equipment')?.value || $('level')?.value || queueOnly);
}
function ensureCatalogActions(){
  const panel=$('searchPanel');
  if(!panel || $('catalogActions'))return;
  const actions=document.createElement('div');actions.id='catalogActions';actions.className='catalog-actions';
  const show=button('Προβολή όλων των ασκήσεων',()=>{catalogRevealed=true;renderCards();});
  show.id='showAllExercises';
  const hide=button('Απόκρυψη ασκήσεων',()=>{catalogRevealed=false;$('query').value='';$('muscle').value='';$('equipment').value='';$('level').value='';queueOnly=false;render();});
  hide.id='hideExercises';
  actions.append(show,hide);
  panel.append(actions);
}
function saveReviews(next){try{localStorage.setItem(REVIEW_KEY,JSON.stringify(next));reviews=next;return true;}catch(e){msg('Αποτυχία αποθήκευσης αξιολόγησης: '+e.message);return false;}}
function changeReview(id,status){stopExercisePlayer();const next=reviewConcept(id,status,reviews);if(!saveReviews(next))return;$('studio').classList.remove('detail-open');selected=null;render();msg(status==='approved'?'Εγκρίθηκε ολόκληρη η άσκηση μαζί με τις φάσεις της.':'Απορρίφθηκε ολόκληρη η άσκηση και αφαιρέθηκε από τον κατάλογο αυτού του browser.');}

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('el-GR');
const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=String(value??'');if(cls)el.className=cls;return el;};
const button=(title,fn)=>{const b=text('button',title);b.addEventListener('click',fn);return b;};
const msg=s=>$('notice').textContent=s;
function load(){try{const raw=JSON.parse(localStorage.getItem(STORE)||'null');if(raw&&Array.isArray(raw.exercises)&&Array.isArray(raw.programs))state=raw;}catch{msg('Πρόβλημα ανάγνωσης τοπικών δεδομένων.');}}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));return true;}catch(e){msg('Αδυναμία αποθήκευσης: '+e.message+' · Εξαγάγετε αντίγραφο και ελέγξτε τη χωρητικότητα.');return false;}}
const name=x=>x.name||x.title||x.gr||'Άσκηση χωρίς τίτλο';
const savedExercises=()=>{const items=new Map(base.exercises.map(x=>[x.id,x]));for(const x of state.exercises)items.set(x.id,{...items.get(x.id),...x});return [...items.values()].filter(x=>!x.requiresCoachReview||reviewStatus(x.id,reviews)!=='rejected').map(x=>x.requiresCoachReview?{...x,reviewStatus:reviewStatus(x.id,reviews),requiresCoachReview:reviewStatus(x.id,reviews)!=='approved'}:x);};
const savedPrograms=()=>{const items=new Map(base.programs.map(x=>[x.id,x]));for(const p of state.programs)items.set(p.id,{...items.get(p.id),...p});return [...items.values()];};
const catalog=()=>mode==='functional'?(queueOnly?[...savedExercises().filter(x=>x.reviewStatus==='pending'),...visibleConcepts(conceptExercises,reviews,true).filter(x=>x.reviewStatus==='pending')]:[...savedExercises(),...visibleConcepts(conceptExercises,reviews,showConcepts)]):savedExercises();
const equipment=x=>Array.isArray(x.equipment)?x.equipment:(x.equipment?[x.equipment]:[]);
const muscles=x=>[...(Array.isArray(x.muscles)?x.muscles:[]),...(Array.isArray(x.primaryMuscles)?x.primaryMuscles:[]),...(Array.isArray(x.detailedMuscles)?x.detailedMuscles:[])].filter(Boolean);
const discipline=x=>x.discipline==='pilates'||x.trainingType==='reformer'?'pilates':'functional';
function openMode(next){catalogRevealed=false;stopExercisePlayer();$('studio').classList.remove('detail-open');selected=null;mode=next;tab='exercises';$('welcome').hidden=true;$('studio').hidden=false;$('back').hidden=false;$('studioTitle').textContent=next==='functional'?'Functional Training':'Pilates';$('query').value='';$('level').value='';limit=20;render();}
document.querySelectorAll('[data-mode]').forEach(x=>x.addEventListener('click',()=>openMode(x.dataset.mode)));
$('back').onclick=()=>{stopExercisePlayer();$('studio').classList.remove('detail-open');selected=null;$('studio').hidden=true;$('welcome').hidden=false;$('back').hidden=true;mode=null;};
document.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{tab=x.dataset.tab;catalogRevealed=false;limit=20;render();});
function filtered(){const q=norm($('query').value.trim()),level=$('level').value,muscle=$('muscle').value,eq=$('equipment').value;return catalog().filter(x=>discipline(x)===mode&&(!level||x.level===level)&&(!eq||equipment(x).includes(eq))&&(!muscle||muscles(x).includes(muscle)||x.category===muscle)&&(!q||norm([name(x),x.category,x.instructions,...muscles(x),...equipment(x)].join(' ')).includes(q))&&(tab!=='stretches'||/stretch|mobility|διατα|κινητικο/.test(norm([x.category,x.name,x.goal,x.discipline].join(' ')))));}
function filters(){const list=catalog().filter(x=>discipline(x)===mode);for(const [id,values] of [['muscle',list.flatMap(x=>[...muscles(x),x.category].filter(Boolean))],['equipment',list.flatMap(equipment)]]){const e=$(id),old=e.value,first=e.options[0].text;e.replaceChildren(new Option(first,''));[...new Set(values)].sort((a,b)=>a.localeCompare(b,'el')).forEach(x=>e.add(new Option(x,x)));if([...e.options].some(o=>o.value===old))e.value=old;}}
for(const id of ['query','muscle','equipment','level'])$(id).addEventListener(id==='query'?'input':'change',()=>{limit=20;renderCards();});
function renderCards(){
  ensureCatalogActions();
  const target=$('cards');target.replaceChildren();
  const visible=catalogRevealed||hasActiveExerciseFilters();
  $('showAllExercises').hidden=visible;
  $('hideExercises').hidden=!visible;
  if(!visible){
    $('count').textContent='Η βιβλιοθήκη παραμένει κρυφή. Χρησιμοποιήστε αναζήτηση, φίλτρα ή «Προβολή όλων».';
    target.append(text('p','Οι ασκήσεις θα εμφανιστούν μόνο όταν τις ζητήσετε.','catalog-empty'));
    if(!selected)$('detail').hidden=true;
    return;
  }
  const arr=filtered();$('count').textContent=arr.length+' αποτελέσματα · '+catalog().filter(x=>discipline(x)===mode).length+' στη βιβλιοθήκη';for(const x of arr.slice(0,limit)){const card=text('article','','card');card.append(text('span',x.requiresCoachReview?'ΥΠΟ ΑΞΙΟΛΟΓΗΣΗ':(x.level||'—'),'badge'),text('h3',name(x)),text('p',equipment(x).join(' · ')||'Βάρος σώματος'));card.append(button('Προβολή άσκησης',()=>viewExercise(x)));target.append(card);}if(arr.length>limit)target.append(button('Περισσότερες ασκήσεις',()=>{limit+=20;renderCards();}));if(!arr.length)target.append(text('p','Δεν βρέθηκαν ασκήσεις. Αλλάξτε κριτήρια ή εισαγάγετε αρχείο JSON.'));if(!selected)$('detail').hidden=true;}
function previewKind(src){if(typeof src!=='string')return 'none';if(src.startsWith('data:image/svg+xml'))return 'placeholder';if(src.startsWith('data:image/')||/^https?:\/\//.test(src)||src.startsWith('/'))return 'image';return 'none';}


function openVisualLightbox(src,alt){
 if(!src)return;
 const backdrop=document.createElement('div');backdrop.className='sofia-lightbox';backdrop.setAttribute('role','dialog');backdrop.setAttribute('aria-modal','true');backdrop.setAttribute('aria-label','Μεγέθυνση φωτογραφίας');
 const bar=document.createElement('div');bar.className='sofia-lightbox-bar';
 const photo=document.createElement('img');photo.src=src;photo.alt=alt||'Φωτογραφία άσκησης';
 const close=button('✕ Κλείσιμο',()=>dismiss());
 const mirror=button('⇆ Κατοπτρισμός 2D',()=>photo.classList.toggle('mirrored'));
 function dismiss(){backdrop.remove();document.removeEventListener('keydown',onKey);}
 const onKey=e=>{if(e.key==='Escape')dismiss();};
 bar.append(mirror,close);backdrop.append(bar,photo);
 backdrop.addEventListener('click',e=>{if(e.target===backdrop)dismiss();});
 document.addEventListener('keydown',onKey);
 document.body.append(backdrop);close.focus();
}

let exercisePlayerCleanup=()=>{};
function stopExercisePlayer(){exercisePlayerCleanup();exercisePlayerCleanup=()=>{};}
function createExercisePlayer(filmstrip,total,level){
 const wrap=text('section','','exercise-player');
 const hero=text('div','','exercise-player-hero');const heroImage=document.createElement('img');heroImage.alt='Προεπισκόπηση επιλεγμένης φάσης';heroImage.hidden=true;const heroFallback=text('p','Δεν υπάρχει ακόμη εικόνα γι’ αυτή τη φάση.','warning');hero.append(heroImage,heroFallback);heroImage.addEventListener('click',()=>openVisualLightbox(heroImage.src,heroImage.alt));heroImage.tabIndex=0;heroImage.setAttribute('role','button');heroImage.setAttribute('aria-label','Μεγέθυνση εικόνας');heroImage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openVisualLightbox(heroImage.src,heroImage.alt);}});const controls=text('div','','exercise-player-controls');
 const play=button('▶ Έναρξη άσκησης',()=>toggle());
 const reset=button('↺ Από την αρχή',()=>{pause();show(0);});
 const label=text('label','Ταχύτητα προβολής');
 const select=document.createElement('select');
 for(const [ms,title] of [[5500,'Πολύ αργή · 5,5 δευτ./φάση'],[4500,'Αργή · 4,5 δευτ./φάση'],[3500,'Σταθερή · 3,5 δευτ./φάση'],[2000,'Γρήγορη · 2 δευτ./φάση']])select.add(new Option(title,String(ms)));
 select.value=level==='Advanced'?'5500':level==='Intermediate'?'4500':'3500';label.append(select);
 const status=text('p','','muted');status.setAttribute('aria-live','polite');
 let timer=null,index=0;
 const cells=()=>Array.from(filmstrip.querySelectorAll('.phase'));
 function show(i){index=Math.max(0,Math.min(total-1,i));cells().forEach((cell,n)=>cell.classList.toggle('active-frame',n===index));const cell=cells()[index];if(cell){cell.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});const candidate=cell.querySelector('img');if(candidate&&candidate.complete&&candidate.naturalWidth>0){heroImage.src=candidate.currentSrc||candidate.src;heroImage.hidden=false;heroFallback.hidden=true;}else{heroImage.hidden=true;heroFallback.hidden=false;heroFallback.textContent='Φάση '+(index+1)+': δεν έχει παραχθεί ακόμη διαθέσιμη εικόνα.';}}status.textContent='Φάση '+(index+1)+' από '+total+(index===total-1?' · Τέλος επανάληψης':'');}
 function pause(){if(timer!==null)clearTimeout(timer);timer=null;play.textContent=index===total-1?'▶ Επανάληψη':'▶ Συνέχεια';}
 function tick(){if(timer===null)return;if(index>=total-1){pause();return;}show(index+1);if(index===total-1){pause();return;}timer=setTimeout(tick,Number(select.value));}
 function toggle(){if(timer!==null){pause();return;}if(index===total-1)show(0);play.textContent='Ⅱ Παύση';timer=setTimeout(tick,Number(select.value));}
 select.addEventListener('change',()=>{if(timer!==null){clearTimeout(timer);timer=setTimeout(tick,Number(select.value));}});
 const imageListeners=[];
 cells().forEach((cell,i)=>{cell.addEventListener('click',()=>{pause();show(i);});for(const image of cell.querySelectorAll('img')){const loaded=()=>{if(i===index)show(index);};image.addEventListener('load',loaded);imageListeners.push([image,loaded]);}});
 controls.append(play,reset,label);wrap.append(hero,controls,status);
 show(0);
 exercisePlayerCleanup=()=>{if(timer!==null)clearTimeout(timer);timer=null;for(const [image,loaded] of imageListeners)image.removeEventListener('load',loaded);};
 return wrap;
}

function viewExercise(x){stopExercisePlayer();selected=x.id;$('studio').classList.add('detail-open');const d=$('detail');d.replaceChildren(text('h2',name(x)),text('p',x.level+' · '+(x.category||'Functional')),text('h3','Εκτέλεση'),text('p',x.instructions||x.description||'Δεν υπάρχει ακόμη εγκεκριμένη περιγραφή.'),text('h3','Μυϊκές ομάδες'),text('p',muscles(x).join(', ')),text('h3','Αναπνοή'),text('p',x.breathing||'Δεν έχει καταχωριστεί.'),text('h3','Συχνά λάθη / Προφυλάξεις'),text('p',x.safety||'Δεν έχουν καταχωριστεί.'));if(x.requiresCoachReview)d.append(text('p','ΠΡΩΤΟΤΥΠΗ ΠΡΟΤΑΣΗ — Δεν έχει εγκριθεί για εκτέλεση από προπονητή.','warning'));if(x.newConcept||x.id.startsWith('hybrid-')){const status=reviewStatus(x.id,reviews);const actions=text('div','','exercise-review-actions');actions.append(text('p',status==='approved'?'Η άσκηση έχει εγκριθεί συνολικά.':'Αξιολόγηση ολόκληρης άσκησης (όλες οι φάσεις και οι εικόνες).','muted'));if(status!=='approved')actions.append(button('✓ Έγκριση ολόκληρης άσκησης',()=>changeReview(x.id,'approved')));if(status!=='rejected')actions.append(button('× Απόρριψη ολόκληρης άσκησης',()=>{if(confirm('Να απορριφθεί ΟΛΟΚΛΗΡΗ η άσκηση, μαζί με όλες τις φάσεις της;'))changeReview(x.id,'rejected');}));d.append(actions);}const libraryEntry=playerImageEntry(imageLibrary[x.id]);if(libraryEntry?.status==='pending_visual_review')d.append(text('p','Η φωτογραφική ακολουθία εκκρεμεί για έλεγχο Sofia.'+(Object.keys(libraryEntry.blockedPhases||{}).length?' Ορισμένα καρέ έχουν αποκλειστεί λόγω προβλημάτων εικόνας ή κίνησης.':''),'warning'));const phases=Array.isArray(x.phases)?x.phases:[];const storyboard=libraryEntry?.previewActive?libraryEntry.labels.map((label,i)=>({phase:i+1,label,labelEl:label})):Array.isArray(x.imagePrompts)&&x.imagePrompts.length?x.imagePrompts.map((p,i)=>({...p,labelEl:p.label||('Φάση '+(i+1)),label:p.label||('Φάση '+(i+1))})):originalAdvancedFrames(x)||exerciseStoryboard(x);const grid=text('div','','phasegrid');grid.setAttribute('role','group');grid.setAttribute('aria-label','Οριζόντια κινηματογραφική ακολουθία '+storyboard.length+' φάσεων');let real=0;const phaseImages=Array.isArray(x.phaseImages)?x.phaseImages:[];for(let i=0;i<storyboard.length;i++){const ph=phases[i]||{},mapped=imageFor(x,x.id,i,{...imageLibrary,[x.id]:libraryEntry}),url=mapped?.url||phaseImages[i]?.image||phaseImages[i]?.url||ph.image||x.images?.[i]||'',kind=previewKind(url),cell=text('div','','phase');cell.append(text('small',(i+1)+'. '+(mapped?.label||libraryEntry?.labels?.[i]||storyboard[i].labelEl)));if(mapped?.status==='rejected'){cell.append(text('p','Η φωτογραφία είχε αποκλειστεί σε παλαιότερο έλεγχο. Η απόφαση για την άσκηση γίνεται πλέον συνολικά.','warning'));}else if(kind==='image'){const image=document.createElement('img');image.src=url;image.alt=name(x)+' — '+(mapped?.label||ph.label||storyboard[i].labelEl);image.loading='lazy';image.onerror=()=>image.replaceWith(text('p','Μη διαθέσιμη εικόνα'));cell.append(image,button('⤢ Μεγέθυνση',()=>openVisualLightbox(image.currentSrc||image.src,image.alt)));if(mapped?.status==='pending_visual_review')cell.append(text('p','Φωτογραφία υπό τεχνική αξιολόγηση','warning'));real++;}else cell.append(text('p',kind==='placeholder'?'Προσωρινό SVG — όχι πραγματική στάση':(libraryEntry?.blockedPhases?.[String(i+1)]?'Το καρέ αποκλείστηκε: απαιτείται νέα εικόνα και τεχνικός έλεγχος.':'Απαιτείται εικόνα κίνησης'),'warning'));grid.append(cell);void renderStoredFrame(cell,x,i); }d.append(text('h3','Ολόκληρη επανάληψη · '+storyboard.length+' φάσεις'),text('p','Διαβάζετε τα καρέ από αριστερά προς τα δεξιά. Σύρετε οριζόντια για να δείτε όλες τις φάσεις και την επιστροφή στην αρχική θέση.','muted'),grid);d.append(createExercisePlayer(grid,storyboard.length,x.level));if(!real)d.append(text('p','Δεν υπάρχουν ακόμη πραγματικές, επαληθευμένες εικόνες των φάσεων. Η αναπαραγωγή επιλέγει διαδοχικά τα διαθέσιμα καρέ, δεν παράγει κίνηση.','warning'));renderCandidateReview(d,x,libraryEntry);renderPrompts(d,x);void renderBatchStoryboard(d,x);d.prepend(button('← Επιστροφή στις ασκήσεις',()=>{stopExercisePlayer();selected=null;$('studio').classList.remove('detail-open');d.hidden=true;window.scrollTo({top:0,behavior:'instant'});}));d.hidden=false;window.scrollTo({top:0,behavior:'instant'});}
async function renderStoredFrame(cell,x,i){
 try{
  const current=await getFrame(x.id,i);
  if(current?.blob){
   const url=URL.createObjectURL(current.blob),img=document.createElement('img');
   img.src=url;img.alt=name(x)+' — φάση '+(i+1);img.onload=()=>URL.revokeObjectURL(url);
   cell.append(img,button('⤢ Μεγέθυνση',()=>openVisualLightbox(img.currentSrc||img.src,img.alt)),text('p',current.reviewStatus==='approved'?'Εικόνα εγκεκριμένη':'Εικόνα προς έλεγχο','warning'));
   
  }
  const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.setAttribute('aria-label','Εικόνα φάσης '+(i+1));
  input.onchange=async()=>{try{await setFrame(x.id,i,input.files?.[0]);msg('Η εικόνα αποθηκεύτηκε για έλεγχο σε αυτόν τον browser.');viewExercise(x)}catch(e){msg(e.message)}};
  cell.append(input);
 }catch(e){cell.append(text('p','Τοπική αποθήκευση εικόνων μη διαθέσιμη: '+e.message,'warning'))}
}
const SHARED_SCENE='The setting is a modern, premium personal training studio with warm cinematic lighting, gray marble stone surfaces, natural oak wood panels, architectural greenery, elegant neutral colors, and minimal uncluttered training equipment. Same studio architecture, camera, proportions and lighting in every frame.';
const MALE_MODEL='A fit Greek male model, around 25-30 years old, with dark hair and athletic physique, wearing a black fitted fitness t-shirt, dark charcoal gray short compression leggings and white training shoes.';
const FEMALE_MODEL='A fit Greek female model, around 25-30 years old, with dark hair and athletic physique, wearing a black fitted sports top, dark charcoal gray short biker leggings and white training shoes.';
function standardizePrompt(exercise,cue){
 const profile=exercise.modelProfile==='female'?'female':exercise.modelProfile==='male'?'male':/female|woman|γυναικ/i.test(String(exercise.name||''))?'female':'male';
 return (profile==='female'?FEMALE_MODEL:MALE_MODEL)+' '+SHARED_SCENE+' Movement phase: '+String(cue||'').replace(/The setting is a modern, premium, high-end personal training studio[^.]*\./gi,'').trim()+' Full body visible, fixed three-quarter camera, correct joint anatomy, no text, no logos. This is an unverified generation prompt; it is not an existing photograph.';
}

function renderPrompts(target,exercise){const frames=Array.isArray(exercise.imagePrompts)&&exercise.imagePrompts.length?exercise.imagePrompts.map(p=>({...p,label:p.label||'Phase '+p.phase,labelEl:p.label||'Φάση '+p.phase})):originalAdvancedFrames(exercise)||exerciseStoryboard(exercise);const h=document.createElement('h3');h.textContent='DALL-E: '+frames.length+' στάδια';target.append(h);const note=document.createElement('p');note.textContent='Αγγλικές οδηγίες παραγωγής. Δεν είναι έτοιμες ή πιστοποιημένες εικόνες.';target.append(note);const exportButton=button('Λήψη prompts όλων των φάσεων',()=>{const lines=frames.map(frame=>'PHASE '+frame.phase+' — '+frame.label+'\n'+standardizePrompt(exercise,frame.prompt)).join('\n\n');const blob=new Blob([lines],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=(exercise.id||'exercise')+'-image-prompts.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);});target.append(exportButton);for(const frame of frames){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Φάση '+frame.phase+': '+frame.labelEl;const p=document.createElement('p');p.textContent=standardizePrompt(exercise,frame.prompt||frame.cue);details.append(summary,p);target.append(details);}}
async function renderBatchStoryboard(target,exercise){
 const n=Number((exercise.id||'').split('-').at(-1));
 if(!Number.isInteger(n)||n<21||n>100)return;
 const start=Math.floor((n-1)/10)*10+1;
 const end=start+9;
 const pad=x=>String(x).padStart(3,'0');
 const file=start<60?'visual-batch-'+pad(start)+'-'+pad(end)+'.json':'visual-batch-'+start+'-'+end+'.json';
 const section=document.createElement('section');section.className='batch-review';section.append(text('h3','Εξειδικευμένο storyboard · '+pad(start)+'–'+pad(end)),text('p','Προσχέδιο εικόνων υπό αξιολόγηση. Δεν υπάρχει ακόμη πιστοποιημένη φωτογραφική απεικόνιση.','warning'));
 target.append(section);
 try{
  const response=await fetch('/data/'+file);
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  const record=data.exercises.find(item=>item.id===exercise.id);
  if(!record)throw Error('Missing exercise '+exercise.id);
  for(const frame of record.phases){
   const details=document.createElement('details');
   details.append(text('summary','Φάση '+frame.phase+' — '+frame.label),text('p',frame.sourceCue),text('p',frame.prompt));
   section.append(details);
  }
 }catch(e){section.append(text('p','Δεν φορτώθηκε το εξειδικευμένο storyboard: '+e.message,'warning'));}
}
function renderPrograms(){const g=$('programCards');g.replaceChildren();const list=savedPrograms().filter(p=>(p.discipline||'functional')===mode);for(const p of list){const c=text('article','','card');c.append(text('h3',p.name||p.title||p.id),text('p',(p.level||'')+' · '+(p.durationMinutes||((p.blocks||[]).reduce((a,b)=>a+Number(b.minutes||0),0)))+' λεπτά'));c.append(button('Προβολή προγράμματος',()=>{const d=$('programDetail');d.replaceChildren(text('h2',p.name||p.title||p.id));const ol=document.createElement('ol');for(const b of p.blocks||[]){const li=text('li',b.minutes+'′ — '+b.activity);const id=b.activity.match(/\bfunctional-\d{3}\b/)?.[0];const exercise=id?savedExercises().find(x=>x.id===id):null;if(exercise)li.append(button('Προβολή άσκησης και φωτογραφιών',()=>{tab='exercises';render();viewExercise(exercise)}));ol.append(li);}d.append(ol);d.hidden=false;d.scrollIntoView({behavior:'smooth'});}));g.append(c);}if(!list.length)g.append(text('p','Δεν υπάρχουν αποθηκευμένα προγράμματα σε αυτή την ενότητα.'));}
function render(){const queueToggle=$('queueOnly');if(queueToggle){queueToggle.closest('label').hidden=mode!=='functional';queueToggle.checked=queueOnly;}const conceptsToggle=$('concepts');if(conceptsToggle){conceptsToggle.closest('label').hidden=mode!=='functional';conceptsToggle.checked=showConcepts;}const rc=$('reviewCounts');if(rc){const a=reviewCounts(conceptExercises,reviews);rc.hidden=mode!=='functional'||a.pending===0;rc.textContent='Προτάσεις Sofia: '+a.pending+' σε αναμονή · '+a.approved+' εγκεκριμένες · '+a.rejected+' απορρίφθηκαν';}document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('selected',x.dataset.tab===tab));$('searchPanel').hidden=tab!=='exercises'&&tab!=='stretches';$('results').hidden=tab!=='exercises'&&tab!=='stretches';$('programPanel').hidden=tab!=='programs';$('dataPanel').hidden=tab!=='data';if(tab==='exercises'||tab==='stretches'){filters();renderCards();}else if(tab==='programs')renderPrograms();}
function validate(data){if(!data||!Array.isArray(data.exercises)||!Array.isArray(data.programs))throw Error('Το JSON πρέπει να περιέχει πίνακες exercises και programs.');const exerciseIds=new Set(),programIds=new Set();for(const x of data.exercises){if(!x||typeof x.id!=='string'||!x.id.trim()||!(typeof (x.name||x.title||x.gr)==='string'&&(x.name||x.title||x.gr).trim())||exerciseIds.has(x.id))throw Error('Άκυρο ή διπλό ID άσκησης: '+x?.id);exerciseIds.add(x.id);}for(const p of data.programs){if(!p||typeof p.id!=='string'||!p.id.trim()||programIds.has(p.id)||!Array.isArray(p.blocks))throw Error('Άκυρο πρόγραμμα: '+p?.id);if(p.blocks.some(b=>!b||typeof b.activity!=='string'||!b.activity.trim()||!Number.isFinite(Number(b.minutes))||Number(b.minutes)<=0))throw Error('Μη έγκυρο τμήμα προγράμματος '+p.id);const minutes=p.blocks.reduce((a,b)=>a+Number(b.minutes||0),0);if(Math.abs(minutes-60)>0.001)throw Error('Το πρόγραμμα '+p.id+' δεν είναι 60 λεπτών.');programIds.add(p.id);}return data;}
$('import').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=validate(JSON.parse(await file.text()));if(data.sofiaReviews){const imported=sanitizeReviews(data.sofiaReviews);if(!saveReviews({...reviews,...imported}))return;}const ex=new Map(state.exercises.map(x=>[x.id,x])),pr=new Map(state.programs.map(x=>[x.id,x]));for(const x of data.exercises)ex.set(x.id,{...ex.get(x.id),...x});for(const p of data.programs)pr.set(p.id,{...pr.get(p.id),...p});const previous=state;state={exercises:[...ex.values()],programs:[...pr.values()]};if(!save()){state=previous;return;}msg('Εισήχθησαν '+data.exercises.length+' ασκήσεις και '+data.programs.length+' προγράμματα, με συγχώνευση IDs.');render();}catch(err){msg('Η εισαγωγή ακυρώθηκε: '+err.message);}finally{e.target.value='';}};
$('export').onclick=()=>{const b=new Blob([JSON.stringify({schemaVersion:4,exercises:savedExercises(),programs:savedPrograms(),sofiaReviews:reviews},null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='Sofia_Backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
$('voice').onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){msg('Η φωνητική αναγνώριση δεν υποστηρίζεται εδώ. Δοκίμασε Chrome σε ασφαλές περιβάλλον HTTPS ή πληκτρολόγησε.');return;}if(!mode)openMode('functional');const r=new R();r.lang='el-GR';r.onresult=e=>{const speech=e.results[0][0].transcript,spoken=norm(speech);const match=spoken.match(/\b(\d+)\b/),n=match?Math.min(100,Number(match[1])):20;const levels=[['advanced','Advanced'],['προχωρημεν','Advanced'],['intermediate','Intermediate'],['beginner','Beginner'],['αρχαρι','Beginner']];$('level').value=levels.find(([word])=>spoken.includes(word))?.[1]||'';let group='';for(const g of ['Πόδια & Γλουτοί','Πλάτη','Ώμοι','Κορμός','Στήθος']){if((g==='Πόδια & Γλουτοί'&&/ποδ|γλουτ/.test(spoken))||(g==='Πλάτη'&&/πλατ/.test(spoken))||(g==='Ώμοι'&&/ωμ/.test(spoken))||(g==='Κορμός'&&/κορμ|κοιλ/.test(spoken))||(g==='Στήθος'&&/στηθ/.test(spoken))){group=g;break;}}$('muscle').value=[...$('muscle').options].some(o=>o.value===group)?group:'';for(const eq of [...$('equipment').options].map(o=>o.value).filter(Boolean)){if(spoken.includes(norm(eq))){$('equipment').value=eq;break;}}$('query').value='';tab='exercises';limit=n;render();msg('Φωνητική αναζήτηση: '+speech+' · αποτελέσματα από την τοπική βιβλιοθήκη.');};r.onerror=e=>msg('Σφάλμα μικροφώνου: '+e.error);try{r.start();}catch(e){msg('Αδυναμία χρήσης μικροφώνου: '+e.message);}};
$('queueOnly').addEventListener('change',e=>{queueOnly=Boolean(e.target.checked);limit=20;tab='exercises';render();});
$('concepts').addEventListener('change',e=>{showConcepts=Boolean(e.target.checked);limit=20;render();msg(showConcepts?'Οι 208 πρωτότυπες ιδέες εμφανίζονται ως ΜΗ ΕΓΚΕΚΡΙΜΕΝΕΣ. Απαιτούν αξιολόγηση προπονητή.':'Εμφανίζονται μόνο αποθηκευμένες ασκήσεις.');});
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
    const originalResponse=await fetch('/data/hybrid-original-library.json',{cache:'no-cache'});
    const originalExercises=originalResponse.ok?await originalResponse.json():[];
    if(!Array.isArray(originalExercises))throw Error('Μη έγκυρη νέα βιβλιοθήκη');
    const exercises=data.slice(0,4).flat(),programs=data[4];
    const ids=new Set(exercises.map(x=>x.id));
    if(ids.size!==100||programs.some(p=>p.blocks.reduce((s,b)=>s+Number(b.minutes||0),0)!==60))throw Error('Μη έγκυρα αρχικά δεδομένα');
    base={exercises:[...exercises,...originalExercises],programs};
    if(mode)render();
    msg('Φορτώθηκαν οι 100 αρχικές ασκήσεις, '+originalExercises.length+' νέες υβριδικές υπό αξιολόγηση και τα 10 προγράμματα των 60 λεπτών.');
  }catch(e){msg('Σφάλμα φόρτωσης αρχικής βιβλιοθήκης: '+e.message+' — δοκίμασε ανανέωση.');}
}
void loadBuiltIn();

void loadImageLibrary().then(entries=>{imageLibrary=entries;});


function renderCandidateReview(target,exercise,entry){
 if(!entry)return;const candidates=[...Object.entries(entry.blockedPhases||{}).map(([phase,reason])=>({url:entry.candidates[Number(phase)-1],reason})),...(entry.additionalReviewCandidates||[]).map(url=>({url,reason:entry.reviewNotes})),...(entry.importedCandidates||[]).map(item=>({url:item.url,reason:'Φάση '+item.phase+' · '+item.provider+' · '+item.reviewStatus}))];
 if(!candidates.length)return;const details=document.createElement('details');details.append(text('summary','Αποκλεισμένες εικόνες και νέες δοκιμές για τεχνικό επανέλεγχο'));const grid=text('div','','phasegrid');for(const item of candidates){const cell=text('div','','phase');const img=document.createElement('img');img.src=item.url;img.alt=name(exercise)+' — δοκιμαστική εικόνα προς επανέλεγχο';img.loading='lazy';cell.append(img,text('p','Δεν έχει συνδεθεί ως έγκυρη φάση.','warning'),text('p',item.reason));grid.append(cell);}details.append(grid);target.append(details);
}
