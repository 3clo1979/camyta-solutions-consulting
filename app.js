import { phases, makeBrief, adjacentTab } from './content.js';
const menuToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
const closeMenu=()=>{nav.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');};
menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);menuToggle.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){closeMenu();menuToggle.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
const desktopQuery=window.matchMedia('(min-width: 801px)');
desktopQuery.addEventListener('change',closeMenu);
const tabs=[...document.querySelectorAll('[role="tab"]')];
const panel=document.querySelector('#phase-panel');
function selectPhase(tab){
 const data=phases[tab.dataset.phase];if(!data)return;
 tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;});
 panel.setAttribute('aria-labelledby',tab.id);
 document.querySelector('#phase-kicker').textContent=data.kicker;
 document.querySelector('#phase-title').textContent=data.title;
 document.querySelector('#phase-description').textContent=data.description;
 document.querySelector('#artifact-name').textContent=data.artifact;
 document.querySelector('#artifact-question').textContent=data.question;
 document.querySelector('#artifact-outcome').textContent=data.outcome;
 document.querySelector('#phase-list').replaceChildren(...data.tasks.map(text=>{const item=document.createElement('li');item.textContent=text;return item;}));
 document.querySelector('#artifact-rows').replaceChildren(...data.rows.map(([label,value])=>{const row=document.createElement('div');const span=document.createElement('span');span.textContent=label;const strong=document.createElement('b');strong.textContent=value;row.append(span,strong);return row;}));
}
tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectPhase(tab));
 tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const target=tabs[adjacentTab(index,event.key,tabs.length)];selectPhase(target);target.focus();});
});
const form=document.querySelector('#brief-form');
const result=document.querySelector('#brief-result');
const goal=document.querySelector('#project-goal');
let brief='';
form.addEventListener('submit',event=>{
 event.preventDefault();goal.setCustomValidity('');
 try{
  const data=new FormData(form);
  brief=makeBrief({support:data.getAll('support'),stage:data.get('stage'),goal:data.get('goal')});
  document.querySelector('#brief-summary').textContent=brief;
  result.hidden=false;result.focus();
 }catch(error){goal.setCustomValidity(error.message);goal.reportValidity();goal.focus();}
});
form.addEventListener('input',event=>{goal.setCustomValidity('');if(event.target.closest('#brief-result'))return;if(!result.hidden){result.hidden=true;brief='';}});
form.addEventListener('change',event=>{if(event.target.closest('#brief-result'))return;if(!result.hidden){result.hidden=true;brief='';}});
document.querySelector('#edit-brief').addEventListener('click',()=>{result.hidden=true;brief='';goal.focus();});
document.querySelector('#year').textContent=String(new Date().getFullYear());

const sendButton=document.querySelector('#send-inquiry');
const sendStatus=document.querySelector('#send-status');
let sending=false,sent=false,requestId='',previousPayload='';
const newInquiry=()=>{if(sending)return;sent=false;sendButton.disabled=false;sendStatus.textContent='';};
form.addEventListener('input',newInquiry);
form.addEventListener('change',newInquiry);
document.querySelector('#edit-brief').addEventListener('click',newInquiry);
sendButton.addEventListener('click',async()=>{
 if(sending||sent||!brief)return;
 const name=document.querySelector('#contact-name'),email=document.querySelector('#contact-email');
 if(!name.value.trim()){sendStatus.textContent='Please enter your name.';name.focus();return;}
 if(!email.value.trim()||!email.validity.valid){sendStatus.textContent='Please enter a valid email address.';email.focus();return;}
 const data=new FormData(form);
 const payload={name:name.value.trim(),email:email.value.trim(),goal:goal.value,support:data.getAll('support'),stage:data.get('stage'),website:document.querySelector('#contact-website').value};
 const canonical=JSON.stringify(payload);
 if(canonical!==previousPayload||!requestId){requestId=Date.now()+'_'+crypto.randomUUID();previousPayload=canonical;}
 sending=true;sendButton.disabled=true;sendStatus.textContent='Sending your inquiry…';
 const controls=[...form.querySelectorAll('input,textarea,select,button')];const disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);
 try{
  const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId}),signal:AbortSignal.timeout(18000)});
  const outcome=await response.json();
  if(!response.ok)throw Error(outcome.message||'Sending could not be confirmed. Please retry or email Carlos.');
  sent=true;sendStatus.textContent='Thank you! Your inquiry has been submitted.';
 }catch(error){sendStatus.textContent=error.name==='TimeoutError'||error.name==='TypeError'?'Sending could not be confirmed. Retry this same inquiry safely, or email Carlos directly.':error.message;}
 finally{sending=false;controls.forEach((c,i)=>c.disabled=disabled[i]);sendButton.disabled=sent;}
});
