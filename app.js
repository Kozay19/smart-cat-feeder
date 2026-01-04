const weightEl=document.getElementById("weight");
const stockEl=document.getElementById("stock");
const stokLabel=document.getElementById("stokLabel");
const historyEl=document.getElementById("history");
const fidEl=document.getElementById("fid");
const barStock=document.getElementById("barStock");
const cat=document.getElementById("cat");
const aiEl=document.getElementById("aiPredict");

let current="FEEDER_1",feeders={},aiHistory=[];

// ===== AI =====
function aiPredict(stock){
  const now=Date.now();
  aiHistory.push({t:now,s:stock});
  if(aiHistory.length>20)aiHistory.shift();
  if(aiHistory.length<6)return "Mengumpulkan data...";
  const f=aiHistory[0],l=aiHistory.at(-1);
  const ds=f.s-l.s,dt=(l.t-f.t)/60000;
  if(ds<=0||dt<=0)return "Menunggu konsumsi...";
  const menit=Math.floor(stock/(ds/dt));
  return `Habis sekitar ${Math.floor(menit/60)} jam ${menit%60} menit`;
}

// ===== MQTT =====
const client=mqtt.connect("wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",{
  clientId:"web_"+Math.random().toString(16).substr(2,8),
  username:"TugasBesar",
  password:"Leadtheway23"
});

client.on("connect",()=>client.subscribe("feeder/data"));

client.on("message",(t,m)=>{
  const d=JSON.parse(m.toString());
  if(!feeders[d.feeder_id])feeders[d.feeder_id]={hist:[],weight:0,stock:0};
  const f=feeders[d.feeder_id];

  f.weight=d.weight;
  f.stock=parseFloat(((10-d.distance)*10).toFixed(2));

  // ==== RIWAYAT TAP FIX ====
  if(d.uid && d.uid.trim()!==""){
    f.hist.unshift(`⏰ ${new Date().toLocaleTimeString()} - ${d.uid}`);
    if(f.hist.length>6)f.hist.pop();
    cat.classList.add("eat");
    setTimeout(()=>cat.classList.remove("eat"),500);
  }

  if(d.feeder_id===current)render();
});

function render(){
  const f=feeders[current]||{};
  fidEl.innerText=current;
  weightEl.innerText=(f.weight||0).toFixed(1);
  stockEl.innerText=(f.stock||0).toFixed(2);
  barStock.style.width=(f.stock||0)+"%";

  let mood="Banyak",emoji="😺";
  if(f.stock<=10){mood="Habis";emoji="😵";}
  else if(f.stock<=30){mood="Sedikit";emoji="😿";}
  else if(f.stock<=70){mood="Sedang";emoji="😸";}
  stokLabel.innerText=mood;
  cat.innerText=emoji;
  aiEl.innerText=aiPredict(f.stock||0);

  historyEl.innerHTML="";
  (f.hist||[]).forEach(x=>{
    const li=document.createElement("li");
    li.innerText=x;
    historyEl.appendChild(li);
  });
}
