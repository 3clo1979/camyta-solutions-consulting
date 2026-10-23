import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {phases,makeBrief,supportOptions,stageOptions,adjacentTab,contactEmail,briefEmailHref} from '../content.js';
const html=await readFile('index.html','utf8');const js=await readFile('app.js','utf8');const css=await readFile('styles.css','utf8');
test('Every phase has substantial usable content',()=>{assert.equal(Object.keys(phases).length,5);for(const p of Object.values(phases)){assert.ok(p.description.length>100);assert.equal(p.tasks.length,3);assert.equal(p.rows.length,3);assert.ok(p.outcome.length>30);}});
test('Phase tab controls match data and have correct initial selection',()=>{for(const key of Object.keys(phases))assert.ok(html.includes(`data-phase="${key}"`));assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);assert.ok(html.includes('role="tabpanel"'));});
test('Keyboard tab navigation wraps and supports Home/End',()=>{assert.equal(adjacentTab(4,'ArrowRight',5),0);assert.equal(adjacentTab(0,'ArrowLeft',5),4);assert.equal(adjacentTab(3,'Home',5),0);assert.equal(adjacentTab(0,'End',5),4);assert.equal(adjacentTab(2,'x',5),2);});
test('Brief includes selected supports and no submitted claim',()=>{const result=makeBrief({support:[supportOptions[0],supportOptions[2]],stage:stageOptions[3],goal:'Improve intake routing.'});assert.match(result,/Discovery & requirements, Scope & planning/);assert.match(result,/Already underway/);assert.match(result,/has not been submitted or sent/);});
test('Empty and whitespace-only goals cannot produce a brief',()=>{assert.throws(()=>makeBrief({goal:''}));assert.throws(()=>makeBrief({goal:'   '}));assert.throws(()=>makeBrief({}));});
test('Brief normalizes unsupported options and excessive input',()=>{const result=makeBrief({support:['fake',supportOptions[0],supportOptions[0]],stage:'fake',goal:'x'.repeat(3000)});assert.ok(!result.includes('fake'));assert.match(result,/Exploring an idea/);assert.equal((result.match(/Discovery & requirements/g)||[]).length,1);assert.ok(!result.includes('x'.repeat(2001)));});
test('All internal link targets exist and ids are unique',()=>{const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),id);});
test('All stylesheet, module and image assets exist',async()=>{for(const [,path] of html.matchAll(/(?:src|href)="([^"#]+\.(?:css|js|png|svg|webp))"/g))await access(path);});
test('Contact sends only to same-origin endpoint without browser storage',()=>{assert.doesNotMatch(js,/XMLHttpRequest|localStorage|sessionStorage|sendBeacon|\.innerHTML/);assert.doesNotMatch(html,/https?:\/\/|tel:/);assert.ok(js.includes("fetch('/api/contact'"));assert.match(html,/noindex,nofollow/);});
test('Public UI has accessible labels, reduced motion, mobile styles and honest illustrative labels',()=>{assert.match(html,/for="project-goal"/);assert.match(html,/for="project-stage"/);assert.match(html,/ILLUSTRATIVE/);assert.match(html,/not a client project/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/max-width:480px/);assert.match(js,/Escape/);});
test('Form controls match exported options',()=>{for(const option of [...supportOptions,...stageOptions])assert.ok(html.includes(option.replace(/&/g,'&')));});
test('Security headers block unconnected form and outbound requests',async()=>{const headers=await readFile('_headers','utf8');assert.match(headers,/connect-src 'self'/);assert.match(headers,/form-action 'none'/);assert.match(headers,/frame-ancestors 'none'/);});

test('Responsive line breaks retain whitespace when hidden on mobile',()=>{
  const breaks=[...html.matchAll(/<br\s*\/?>(.)/g)];
  assert.ok(breaks.length>0);
  for(const match of breaks) assert.match(match[1],/\s/,'Every decorative line break must preserve a text separator');
  const mobileText=html.replace(/<br\s*\/?>/g,'').replace(/<[^>]+>/g,'');
  for(const phrase of ['change. We help','problem. Not','aren’t on','needs a']) assert.ok(mobileText.includes(phrase),phrase);
});

test('Email drafts preserve user text and use only the approved recipient',()=>{const brief=makeBrief({goal:'Plan A & B?\nsubject=Other — café'});const url=new URL(briefEmailHref(brief));assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,contactEmail);assert.equal(contactEmail,'carlos@camytaconsulting.com');assert.equal(url.searchParams.get('body'),brief);assert.equal(url.searchParams.get('subject'),'Project inquiry — Camyta Solutions Consulting');assert.equal([...url.searchParams].length,2);for(const [,recipient] of html.matchAll(/href="mailto:([^"]+)"/g))assert.equal(recipient,contactEmail);assert.match(html,/you must review and send it there/);});
test('An empty brief cannot open an email draft',()=>{for(const brief of ['', '   ',undefined])assert.throws(()=>briefEmailHref(brief));});

test("Founder uses approved solo portrait without responsive cropping",()=>{assert.match(html, /src="assets\/carlos-lopez.webp" alt="Carlos Lopez"/);assert.match(css,/\.founder-portrait img\{[^}]*height:auto;object-fit:contain/);assert.doesNotMatch(html,/class="founder-mark"/);});
