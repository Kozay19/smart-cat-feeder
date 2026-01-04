const weightEl=document.getElementById("weight");
const stockEl=document.getElementById("stock");
const stokLabel=document.getElementById("stokLabel");
const historyEl=document.getElementById("history");
const fidEl=document.getElementById("fid");
const barStock=document.getElementById("barStock");
const cat=document.getElementById("cat");
const btn1=document.getElementById("btn1");
const btn2=document.getElementById("btn2");

let current="FEEDER_1";
let feeders={};
let lastUID="";

const client=mqtt.connect("wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",{
  clientId:"web_"+Math.random().toString(16).substr(2,8),
  username:"TugasBesar",
  password:"Leadtheway23"
});

client.on("connect",()=>client.subscribe("feeder/data"));

client.on("message",(t,m)=>{
  const d=JSON.parse(m.toString());
  feeders[d.feeder_id]=feeders[d.feeder_id]||{hist:[]};

  const f=feeders[d.feeder_id];
  f.weight=d.weight||0;
  f.stock=parseFloat(((10-d.distance)*10).toFixed(2));

  if(d.uid && d.uid!==lastUID){
    lastUID=d.uid;
    f.hist.unshift(`⏰ ${new Date().toLocaleTimeString()} - ${d.uid}`);
    if(f.hist.length>8)f.hist.pop();
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
  if(f.stock<=10){mood="Habis";emoji="😵"}
  else if(f.stock<=30){mood="Sedikit";emoji="😿"}
  else if(f.stock<=70){mood="Sedang";emoji="😸"}
  stokLabel.innerText=mood;
  cat.innerText=emoji;

  historyEl.innerHTML="";
  (f.hist||[]).forEach(h=>{
    const li=document.createElement("li");
    li.innerText=h;
    historyEl.appendChild(li);
  });
}

btn1.onclick=()=>switchF(1);
btn2.onclick=()=>switchF(2);
function switchF(n){
  current="FEEDER_"+n;
  btn1.classList.remove("active");
  btn2.classList.remove("active");
  document.getElementById("btn"+n).classList.add("active");
  render();
}

/* 🌙 DARK LIGHT */
const toggle=document.getElementById("themeToggle");
toggle.onclick=()=>{
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  toggle.innerText=document.body.classList.contains("dark")?"🌙":"☀️";
};

/* ⏰ CLOCK */
const clock=document.getElementById("clock");
const dateEl=document.getElementById("date");
setInterval(()=>{
  const n=new Date();
  clock.innerText=n.toLocaleTimeString();
  dateEl.innerText=n.toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
},1000);
