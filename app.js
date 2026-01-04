// ==== ELEMENT ====
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
const clockEl   = document.getElementById("clock");
const dateEl    = document.getElementById("date");
const themeBtn  = document.getElementById("themeToggle");

// ==== CLOCK & DATE ====
setInterval(()=>{
  const now = new Date();
  clockEl.innerText = now.toLocaleTimeString("id-ID");
  dateEl.innerText  = now.toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
},1000);

// ==== DARK LIGHT MODE ====
function setTheme(mode){
  document.body.className = mode;
  localStorage.setItem("theme",mode);
  themeBtn.innerText = mode==="dark"?"🌙":"☀️";
}
themeBtn.onclick=()=>{
  setTheme(document.body.classList.contains("dark")?"light":"dark");
};
setTheme(localStorage.getItem("theme")||"dark");

// ==== STATE ====
let current="FEEDER_1",feeders={},lastUID="",lastTap=0;

// ==== MQTT ====
const client = mqtt.connect("wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",{
  clientId:"web_"+Math.random().toString(16).substr(2,8),
  username:"TugasBesar",
  password:"Leadtheway23"
});

client.on("connect",()=>{
  statusBox.innerText="CONNECTED";
  client.subscribe("feeder/data");
});

client.on("message",(t,m)=>{
  const d=JSON.parse(m.toString());
  if(!feeders[d.feeder_id]) feeders[d.feeder_id]={hist:[],weight:0,stock:0};
  const f=feeders[d.feeder_id];

  f.weight=d.weight;
  f.stock=parseFloat(((10-d.distance)*10).toFixed(2));

  if(d.uid && d.uid!==lastUID){
    lastUID=d.uid; lastTap=Date.now();
    f.hist.unshift(`⏰ ${new Date().toLocaleTimeString()} - ${d.uid}`);
    if(f.hist.length>6)f.hist.pop();
    cat.classList.add("eat");
    setTimeout(()=>cat.classList.remove("eat"),600);
  }
  if(Date.now()-lastTap>2000)lastUID="";
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
