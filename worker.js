import {makeBrief, supportOptions, stageOptions} from './content.js';
const origins = new Set(['https://camytaconsulting.com','https://www.camytaconsulting.com']);
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply = (status,message)=>Response.json({message},{status,headers});
export function validateContact(value) {
 if(!value || typeof value!=='object' || Array.isArray(value)) throw Error('Invalid inquiry.');
 const text=(key,max)=>{const s=value[key];if(typeof s!=='string'||s.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s))throw Error('Please check your inquiry fields.');return s.trim();};
 const name=text('name',100),email=text('email',254),goal=text('goal',2000),website=text('website',200);
 if(!name||/[\r\n]/.test(name)||!goal)throw Error('Enter your name and project goal.');
 if(!/^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(email))throw Error('Enter a valid email address.');
 if(!stageOptions.includes(value.stage)||!Array.isArray(value.support)||value.support.length>supportOptions.length||value.support.some(x=>!supportOptions.includes(x)))throw Error('Choose the listed project options.');
 if(typeof value.requestId!=='string'||!/^\d{13}_[a-f0-9-]{36}$/.test(value.requestId))throw Error('Refresh the page and try again.');
 const age=Date.now()-Number(value.requestId.slice(0,13));if(age<0||age>23*60*60*1000)throw Error('This inquiry expired. Refresh the page before sending.');
 return {name,email,goal,website,support:[...new Set(value.support)],stage:value.stage,requestId:value.requestId};
}
async function readBounded(request){
 const reader=request.body?.getReader();if(!reader)throw Error('Missing inquiry.');let size=0;const chunks=[];
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>12000){await reader.cancel();throw Error('Inquiry is too large.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function handleContact(request,env,send=fetch){
 if(request.method!=='POST')return reply(405,'Use the website inquiry form.');
 if(!origins.has(request.headers.get('Origin')))return reply(403,'Please send from the Camyta website.');
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,'Use the website inquiry form.');
 if(!env.RESEND_API_KEY||!env.CONTACT_RATE_LIMIT||!env.CONTACT_GLOBAL_LIMIT)return reply(503,'Sending is temporarily unavailable. Please email carlos@camytaconsulting.com.');
 let data;try{data=validateContact(await readBounded(request));}catch(error){return reply(400,error.message==='Inquiry is too large.'?error.message:'Please check your name, email and project details, then try again.');}
 if(data.website)return reply(400,'This inquiry could not be accepted. Please email Carlos directly.');
 try{
  const ip=request.headers.get('CF-Connecting-IP');if(!ip)return reply(403,'Unable to validate this request.');
  const ipKey=await digest(ip),emailKey=await digest(data.email.toLowerCase());
  for(const key of ['ip:'+ipKey,'email:'+emailKey])if(!(await env.CONTACT_RATE_LIMIT.limit({key})).success)return reply(429,'Too many attempts. Wait a minute, or email Carlos directly.');
  if(!(await env.CONTACT_GLOBAL_LIMIT.limit({key:'consulting-contact'})).success)return reply(429,'Sending is busy. Wait a minute, or email Carlos directly.');
  const {name,email,goal,support,stage,requestId}=data;
  const text=`Website inquiry\nName: ${name}\nReply email: ${email}\n\nSupport: ${support.join(', ')||'To be discussed'}\nStage: ${stage}\n\nProject goal:\n${goal}\n\nSent through the Camyta website contact form.`;
  const body={from:'Camyta website <website@notify.camytaconsulting.com>',to:['carlos@camytaconsulting.com'],reply_to:email,subject:'Camyta website inquiry',text};
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'camyta-contact/'+requestId},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return reply(502,'Sending could not be confirmed. Retry the same inquiry or email Carlos directly.');
  const accepted=await response.json();if(!accepted.id)return reply(502,'Sending could not be confirmed. Please retry the same inquiry.');
  return reply(200,'Your inquiry was accepted for email delivery to Carlos. Inbox receipt is not yet confirmed.');
 }catch{return reply(502,'Sending could not be confirmed. Retry the same inquiry or email Carlos directly.');}
}
export default {fetch(request,env){return new URL(request.url).pathname==='/api/contact'?handleContact(request,env):env.ASSETS.fetch(request);}};
