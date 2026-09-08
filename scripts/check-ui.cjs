// Optional DOM smoke check: npm install --no-save --package-lock=false jsdom
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
const dom=new JSDOM('<div id="app"></div><div id="toast"></div><dialog id="detail"></dialog>',{url:'http://localhost/',runScripts:'outside-only'});
const w=dom.window;w.structuredClone=structuredClone;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
w.eval(fs.readFileSync('app.js','utf8'));
const q=s=>{const x=w.document.querySelector(s);assert(x,`Missing ${s}`);return x};const click=s=>q(s).click();
const tick=()=>new Promise(r=>setTimeout(r,15));
assert.match(q('h1').textContent,/Overview/);
click('[data-action="new-hunt"]');q('#hypothesis').value='Test unusual execution';click('[data-action="create-hunt"]');await tick();
assert.match(q('.conversation').textContent,/Learn/);click('[data-action="observe"]');click('[data-action="deny-query"]');assert(!w.document.querySelector('[data-action="keep"]'));
click('[data-action="observe"]');click('[data-action="execute"]');q('#reason').value='Unexpected Outlook child process, validated by analyst.';click('[data-action="keep"]');assert.match(q('.conversation').textContent,/record saved/);click('[data-action="promote"]');await tick();assert.match(q('#results').textContent,/Draft PR/);
w.location.hash='approvals';await tick();click('[data-id="A-0820"]');click('[data-action="decide"][data-value="Approved"]');assert(q('#detail').open);q('#engineer-sign').checked=true;q('#tenant-sign').checked=true;click('[data-action="decide"][data-value="Approved"]');assert(!q('#detail').open);
w.location.hash='lotl';await tick();click('[data-id="L-0241"]');q('#disposition').value='Escalated';q('#rationale').value='Unapproved tool with unusual session.';click('[data-action="disposition"]');assert.match(q('#results').textContent,/Escalated/);
w.location.hash='reports';await tick();click('[data-id="R-0090"]');click('[data-action="request-release"]');assert.match(q('#results').textContent,/Awaiting approval/);
for(const page of ['overview','hunts','approvals','lotl','baselines','detections','tenants','reports','audit','settings']){w.location.hash=page;await tick();assert(q('h1').textContent.length>0)}
w.location.hash='hunts';await tick();q('#search').value='no-such-hunt';q('#search').dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(q('#results').textContent,/No matching records/);
console.log('PASS: 10 screens, LOCK approval/deny/completion, detection draft, deployment co-sign, LOTL escalation, report request, and empty search.');dom.window.close();
})().catch(e=>{console.error(e);process.exit(1)});
