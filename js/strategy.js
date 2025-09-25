// simple Strategy demo
class Savings{ static calculate(b){ return b*0.03; } }
class Fixed{ static calculate(b){ return b*0.06; } }
class Current{ static calculate(b){ return 0; } }

document.getElementById('calc').addEventListener('click', ()=>{
  const type = document.getElementById('stype').value;
  const bal = Number(document.getElementById('sbalance').value)||0;
  const strat = type==='savings' ? Savings : type==='fixed' ? Fixed : Current;
  const interest = strat.calculate(bal);
  document.getElementById('result').textContent = `Interest: ${interest.toFixed(2)} — New balance: ${(bal+interest).toFixed(2)}`;
});
