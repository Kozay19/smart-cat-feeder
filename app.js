const weightEl=document.getElementById("weight");
const stockEl=document.getElementById("stock");
const stokLabel=document.getElementById("stokLabel");
const historyEl=document.getElementById("history");
const fidEl=document.getElementById("fid");
const barStock=document.getElementById("barStock");
const cat=document.getElementById("cat");
const aiEl=document.getElementById("aiPredict");

let feeders={},current="FEEDER_1",aiHistory=[];

// ===== AI PREDICTOR =====
function aiPredict(stock){
  const now=Date.now();
  aiHistory.push({t:now,s:stock});
  if(aiHistory.length>20)aiHistory.shift();
  if(aiHistory.length<6)return "Mengumpulkan data...";

  const f=aiHistory[0],l=aiHistory.at(-1);
  const ds=f.s-l.s;
  const dt=(l.t-f.t)/60000;
  if(ds<=0||dt<=0)return "Menunggu konsumsi...";

  const menit=Math.floor(stock/(ds/dt));
  return `Habis sekitar ${Math.floor(menit/60)} jam ${menit%60} menit`;
}

// ==== CLOCK ====
setInterval(()=>{
  const now=new Date();
  document.getElementById("clock").innerText=now.toLocaleTimeString("id-ID");
  document.getElementById("date").innerText=now.toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
},1000);

// ==== MQTT SIMULASI (gantikan ke real broker kamu) ====
setInterval(()=>{
  const stock=Math.max(0,100-Math.random()*50);
  aiEl.innerText=aiPredict(stock);
},4000);
