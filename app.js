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
form.addEventListener('input',()=>{goal.setCustomValidity('');if(!result.hidden){result.hidden=true;brief='';}});
form.addEventListener('change',()=>{if(!result.hidden){result.hidden=true;brief='';}});
document.querySelector('#edit-brief').addEventListener('click',()=>{result.hidden=true;brief='';goal.focus();});
document.querySelector('#download-brief').addEventListener('click',()=>{
 if(!brief)return;
 const blob=new Blob([brief],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='Camyta-Project-Brief.txt';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.querySelector('#year').textContent=String(new Date().getFullYear());
