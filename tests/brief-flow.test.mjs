import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {makeBrief} from '../content.js';
function setup(send){
 const nodes=new Map();
 function element(key){if(nodes.has(key))return nodes.get(key);const e={value:'',hidden:key==='#brief-result',disabled:false,textContent:'',validity:{valid:true},events:{},classList:{remove(){},toggle(){}},addEventListener(type,fn){(this.events[type]??=[]).push(fn)},setAttribute(){},getAttribute(){return 'false'},querySelectorAll(){return key==='#brief-form'?[get('#contact-name'),get('#contact-email'),get('#send-inquiry'),get('#edit-brief')]:[]},focus(){this.focused=true},setCustomValidity(message){this.validation=message},reportValidity(){},closest(){return null},async fire(type){for(const fn of this.events[type]??[])await fn({preventDefault(){},target:this})}};nodes.set(key,e);return e;}
 const get=element;let calls=[];
 const document={querySelector:get,querySelectorAll(){return []},addEventListener(){}};
 const context={document,window:{matchMedia(){return {addEventListener(){}}}},FormData:class {get(key){return key==='goal'?get('#project-goal').value:'Exploring an idea'}getAll(){return []}},makeBrief,Date,crypto:{randomUUID:()=> 'mock-id'},AbortSignal,fetch:async(url,options)=>{calls.push({url,payload:JSON.parse(options.body)});return send(url,options)}};
 vm.runInNewContext(readFileSync('app.js','utf8').replace(/^import[^\n]+\n/,''),context);
 return {get,calls,async preview(){get('#project-goal').value='Improve intake routing.';await get('#brief-form').fire('submit')},async identify(){get('#contact-name').value='Test person';get('#contact-email').value='person@example.com'}};
}
test('Preview and edit retain goal, omit obsolete options and boilerplate',async()=>{
 const h=setup(()=>{throw Error('Unexpected delivery')});await h.preview();assert.equal(h.get('#brief-result').hidden,false);assert.match(h.get('#brief-summary').textContent,/Improve intake/);assert.doesNotMatch(h.get('#brief-summary').textContent,/Prepared locally|submitted|Inbox/);await h.get('#edit-brief').fire('click');assert.equal(h.get('#brief-result').hidden,true);assert.equal(h.get('#project-goal').value,'Improve intake routing.');await h.preview();assert.equal(h.get('#brief-result').hidden,false);assert.equal(h.calls.length,0);
 const html=readFileSync('index.html','utf8');assert.doesNotMatch(html,/download-brief|email-brief|Open email draft|Download brief/);
});
test('Sending disables controls, success is concise, and duplicate clicks do not resubmit',async()=>{
 let finish;const h=setup(()=>new Promise(resolve=>{finish=resolve}));await h.preview();await h.identify();const pending=h.get('#send-inquiry').fire('click');assert.equal(h.get('#send-inquiry').disabled,true);assert.equal(h.get('#edit-brief').disabled,true);assert.match(h.get('#send-status').textContent,/Sending your inquiry/);await h.get('#send-inquiry').fire('click');assert.equal(h.calls.length,1);finish({ok:true,json:async()=>({message:'Verbose server message'})});await pending;assert.equal(h.get('#send-status').textContent,'Thank you! Your inquiry has been submitted.');assert.equal(h.get('#send-inquiry').disabled,true);assert.equal(h.get('#edit-brief').disabled,false);await h.get('#send-inquiry').fire('click');assert.equal(h.calls.length,1);
});
test('Validation blocks missing name and invalid email without delivery',async()=>{
 const h=setup(()=>{throw Error('Unexpected delivery')});await h.preview();await h.get('#send-inquiry').fire('click');assert.match(h.get('#send-status').textContent,/name/);await h.identify();h.get('#contact-email').validity.valid=false;await h.get('#send-inquiry').fire('click');assert.match(h.get('#send-status').textContent,/valid email/);assert.equal(h.calls.length,0);
});
test('Server failure and uncertain network failure allow retry with same idempotency key',async()=>{
 let attempt=0;const h=setup(async()=>{attempt++;if(attempt===1)return {ok:false,json:async()=>({message:'Too many attempts. Wait a minute.'})};if(attempt===2)throw new TypeError('Network failed');return {ok:true,json:async()=>({})}});await h.preview();await h.identify();await h.get('#send-inquiry').fire('click');assert.match(h.get('#send-status').textContent,/Too many attempts/);assert.equal(h.get('#send-inquiry').disabled,false);await h.get('#send-inquiry').fire('click');assert.match(h.get('#send-status').textContent,/could not be confirmed/);assert.equal(h.get('#send-inquiry').disabled,false);await h.get('#send-inquiry').fire('click');assert.equal(new Set(h.calls.map(c=>c.payload.requestId)).size,1);assert.match(h.get('#send-status').textContent,/Thank you/);
});
