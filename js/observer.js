// small self-contained Observer demo (no imports — module for scoping)
class Subject {
  constructor(){ this._observers = [] }
  subscribe(o){ this._observers.push(o) }
  unsubscribe(o){ this._observers = this._observers.filter(x=>x!==o) }
  notify(evt){ this._observers.forEach(o=>o.update(evt)) }
}

class Account extends Subject {
  constructor(id,owner,type,balance=0){
    super(); this.id=id; this.owner=owner; this.type=type; this.balance=balance;
  }
  deposit(amount){ this.balance += amount; this.notify({type:'deposit',account:this,amount}) }
  withdraw(amount){ if(amount>this.balance) throw new Error('Insufficient'); this.balance -= amount; this.notify({type:'withdraw',account:this,amount}) }
  applyInterest(strategy){ const interest = strategy.calculate(this.balance); this.balance += interest; this.notify({type:'interest',account:this,amount:interest}); }
}

class NotificationService {
  constructor(container){ this.container=container }
  update(e){
    const d = document.createElement('div'); d.className='notify'; d.style.padding='8px';
    d.textContent = `[${new Date().toLocaleTimeString()}] ${e.type.toUpperCase()} ${e.amount} on ${e.account.owner} — new ${e.account.balance.toFixed(2)}`;
    this.container.prepend(d);
  }
}

/* Strategy helpers inside observer demo (so we can apply interest here) */
const Savings = { calculate: b => b*0.03 };
const Fixed = { calculate: b => b*0.06 };
const Current = { calculate: b => 0 };

const notificationEl = document.getElementById('notifications');
const notifier = new NotificationService(notificationEl);

const accounts = new Map();
let id = 1;

function refreshLists(){
  const list = document.getElementById('accountsList'); list.innerHTML='';
  const sel = document.getElementById('acctSelect'); sel.innerHTML='';
  accounts.forEach(acc=>{
    const el = document.createElement('div'); el.style.border='1px dashed #e6eefc'; el.style.padding='8px'; el.style.marginBottom='6px';
    el.innerHTML = `<strong>${acc.owner}</strong><div class="muted">${acc.type} — ID:${acc.id}</div><div style="float:right">${acc.balance.toFixed(2)}</div>`;
    list.appendChild(el);
    const opt = document.createElement('option'); opt.value = acc.id; opt.textContent = `${acc.owner} (ID:${acc.id})`;
    sel.appendChild(opt);
  });
}

document.getElementById('create').addEventListener('click', ()=>{
  const owner = document.getElementById('owner').value || 'Unnamed';
  const type = document.getElementById('atype').value;
  const balance = Number(document.getElementById('initial').value) || 0;
  const acc = new Account(id++, owner, type, balance);
  acc.subscribe(notifier);
  accounts.set(acc.id, acc);
  refreshLists();
});

document.getElementById('deposit').addEventListener('click', ()=>{
  const acc = accounts.get(Number(document.getElementById('acctSelect').value));
  const amt = Number(document.getElementById('amount').value)||0;
  try{ acc.deposit(amt); refreshLists(); } catch(e){ alert(e.message) }
});

document.getElementById('withdraw').addEventListener('click', ()=>{
  const acc = accounts.get(Number(document.getElementById('acctSelect').value));
  const amt = Number(document.getElementById('amount').value)||0;
  try{ acc.withdraw(amt); refreshLists(); } catch(e){ alert(e.message) }
});

document.getElementById('interest').addEventListener('click', ()=>{
  const acc = accounts.get(Number(document.getElementById('acctSelect').value));
  if(!acc) return alert('Choose account');
  const strat = acc.type==='savings' ? Savings : acc.type==='fixed' ? Fixed : Current;
  acc.applyInterest(strat); refreshLists();
});

// bootstrap sample
(function(){ const a=new Account(id++,'Sushma','savings',2100); a.subscribe(notifier); accounts.set(a.id,a);
  const b=new Account(id++,'Arjun','current',400); b.subscribe(notifier); accounts.set(b.id,b);
  refreshLists();
})();
