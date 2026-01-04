const statusBox = document.getElementById("status");
const weightEl  = document.getElementById("weight");
const stockEl   = document.getElementById("stock");
const stokLabel = document.getElementById("stokLabel");
const historyEl = document.getElementById("history");
const fidEl     = document.getElementById("fid");
const barStock  = document.getElementById("barStock");
const cat       = document.getElementById("cat");
const btn1      = document.getElementById("btn1");
const btn2      = document.getElementById("btn2");

let current = "FEEDER_1";
let feeders = {};
let lastUID = "";
let lastTapTime = 0;

const client = mqtt.connect("wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",{
  clientId:"web_"+Math.random().toString(16).substr(2,8),
  username:"TugasBesar",
  password:"Leadtheway23",
  protocol:"wss",
  reconnectPeriod:2000,
  clean:true
});

client.on("connect",()=>{
  statusBox.innerText="CONNECTED";
  client.subscribe("feeder/data");
});

client.on("message",(topic,msg)=>{
  const d = JSON.parse(msg.toString());
  if(!feeders[d.feeder_id]) feeders[d.feeder_id]={hist:[],weight:0,stock:0};
  const f = feeders[d.feeder_id];

  f.weight = d.weight;
  let percent = d.distance > 10 ? 0 : (10 - d.distance) * 10;
  f.stock = parseFloat(percent.toFixed(2));

  if(d.uid && d.uid!=="" && d.uid!==lastUID){
    lastUID=d.uid;
    lastTapTime=Date.now();
    f.hist.unshift(`⏰ ${new Date().toLocaleTimeString()} - ${d.uid}`);
    if(f.hist.length>8) f.hist.pop();
    cat.classList.add("eat");
    setTimeout(()=>cat.classList.remove("eat"),600);
  }

  if(Date.now()-lastTapTime>2000) lastUID="";
  if(d.feeder_id===current) render();
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

  historyEl.innerHTML="";
  (f.hist||[]).forEach(x=>{
    const li=document.createElement("li");
    li.innerText=x;
    historyEl.appendChild(li);
  });
}

btn1.onclick=()=>switchFeeder(1);
btn2.onclick=()=>switchFeeder(2);
function switchFeeder(n){
  current="FEEDER_"+n;
  btn1.classList.remove("active");
  btn2.classList.remove("active");
  document.getElementById("btn"+n).classList.add("active");
  render();
}

// ==== REALTIME CLOCK & DATE ====
function updateDateTime(){
  const now=new Date();
  document.getElementById("clock").innerText=now.toLocaleTimeString("id-ID");
  document.getElementById("date").innerText=now.toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
}
setInterval(updateDateTime,1000);
updateDateTime();
