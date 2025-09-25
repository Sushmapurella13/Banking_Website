// small Command demo with an undo stack
class Account {
  constructor(id,owner,balance=0){ this.id=id; this.owner=owner; this.balance=balance; }
  deposit(n){ this.balance += n }
  withdraw(n){ if(n>this.balance) throw new Error('Insufficient'); this.balance -= n }
}

class CommandManager{ constructor(){ this.stack=[] } execute(c){ c.execute(); if(c.canUndo) this.stack.push(c); renderHistory(); } undo(){ const c = this.stack.pop(); if(c) { c.undo(); renderHistory(); } }
}
class Deposit { constructor(acc,amt){ this.acc=acc; this.amt=amt; this.canUndo=true; } execute(){ this.acc.deposit(this.amt) } undo(){ this.acc.withdraw(this.amt) } }
class Withdraw { constructor(acc,amt){ this.acc=acc; this.amt=amt; this.canUndo=true; } execute(){ this.acc.withdraw(this.amt) } undo(){ this.acc.deposit(this.amt) } }
class Transfer { constructor(from,to,amt){ this.from=from; this.to=to; this.amt=amt; this.canUndo=true } execute(){ this.from.withdraw(this.amt); this.to.deposit(this.amt) } undo(){ this.to.withdraw(this.amt); this.from.deposit(this.amt) } }

const cmdm = new CommandManager();
const accts = new Map(); let id=1;
function addAcct(owner,balance=0){ const a=new Account(id++,owner,balance); accts.set(a.id,a); refresh(); }
function refresh(){
  const list = document.getElementById('acctList'); list.innerHTML='';
  const f=document.getElementById('from'), t=document.getElementById('to'); f.innerHTML=''; t.innerHTML='';
  accts.forEach(a=>{
    const el=document.createElement('div'); el.style.padding='8px'; el.style.borderBottom='1px solid #f3f4f6';
    el.innerHTML=`<strong>${a.owner}</strong> <span style="float:right">${a.balance.toFixed(2)}</span>`;
    list.appendChild(el);
    const o=document.createElement('option'); o.value=a.id; o.text=a.owner+' (ID:'+a.id+')'; f.appendChild(o.cloneNode(true)); t.appendChild(o);
  });
  renderHistory();
}
function renderHistory(){
  const h=document.getElementById('history'); h.innerHTML=''; cmdm.stack.slice().reverse().forEach(c=>{
    const d=document.createElement('div'); d.style.padding='6px'; d.style.borderBottom='1px solid #f3f4f6';
    d.textContent = `${c.constructor.name} — ${c.amt?.toFixed ? c.amt.toFixed(2) : ''}`;
    h.appendChild(d);
  });
}

document.getElementById('doDeposit').addEventListener('click', ()=>{
  const acc = accts.get(Number(document.getElementById('from').value));
  const amt = Number(document.getElementById('amt').value)||0;
  try{ cmdm.execute(new Deposit(acc,amt)); refresh(); } catch(e){ alert(e) }
});
document.getElementById('doWithdraw').addEventListener('click', ()=>{
  const acc = accts.get(Number(document.getElementById('from').value));
  const amt = Number(document.getElementById('amt').value)||0;
  try{ cmdm.execute(new Withdraw(acc,amt)); refresh(); } catch(e){ alert(e) }
});
document.getElementById('doTransfer').addEventListener('click', ()=>{
  const from = accts.get(Number(document.getElementById('from').value));
  const to = accts.get(Number(document.getElementById('to').value));
  if(from.id === to.id) return alert('Choose different accounts');
  const amt = Number(document.getElementById('amt').value)||0;
  try{ cmdm.execute(new Transfer(from,to,amt)); refresh(); } catch(e){ alert(e) }
});
document.getElementById('doUndo').addEventListener('click', ()=>{ cmdm.undo(); refresh(); });

addAcct('Sushma',2100); addAcct('Arjun',400); addAcct('Navya',10000);
