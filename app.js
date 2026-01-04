const statusBox = document.getElementById("statusBox");
const weightEl = document.getElementById("weight");
const stockEl  = document.getElementById("stock");
const stokLabelEl = document.getElementById("stokLabel");
const historyEl = document.getElementById("history");
const fidEl = document.getElementById("fid");
const barStock = document.getElementById("barStock");
const moodIcon = document.getElementById("moodIcon");
const mqttStat = document.getElementById("mqttStat");

let current="FEEDER_1";
let feeders={};

const client = mqtt.connect("wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",{
  clientId:"web_"+Math.random().toString(16).substr(2,8),
  username:"TugasBesar",
  password:"Leadtheway23",
  reconnectPeriod:2000
});

client.on("connect",()=>{
  statusBox.innerText="CONNECTED";
  statusBox.className="status connected";
  mqttStat.innerText="ON";
  client.subscribe("feeder/data");
});

client.on("offline",()=>{statusBox.innerText="DISCONNECTED";mqttStat.innerText="OFF";});

client.on("message",(t,m)=>{
  const d=JSON.parse(m.toString());
  if(!feeders[d.feeder_id]) feeders[d.feeder_id]={hist:[]};

  const f=feeders[d.feeder_id];
  f.weight=d.weight;
  f.stock = Math.max(0,Math.min(100,(10-d.distance)*10));

  if(d.uid){
    f.hist.unshift(new Date().toLocaleTimeString()+" - "+d.uid);
  }
  render();
});

function mood(p){
  if(p<=10) return "😿";
  if(p<=30) return "😾";
  if(p<=70) return "😸";
  return "😻";
}

function render(){
  const f=feeders[current]||{};
  fidEl.innerText=current;
  weightEl.innerText=(f.weight||0).toFixed(2);
  stockEl.innerText=(f.stock||0).toFixed(1);
  stokLabelEl.innerText=f.stock<=10?"Habis":f.stock<=30?"Sedikit":f.stock<=70?"Sedang":"Banyak";
  barStock.style.width=(f.stock||0)+"%";
  moodIcon.innerText=mood(f.stock||0);

  historyEl.innerHTML="";
  (f.hist||[]).slice(0,5).forEach(x=>{
    const li=document.createElement("li");
    li.innerText=x;
    historyEl.appendChild(li);
  });
}

function showFeeder(n){
  current="FEEDER_"+n;
  document.getElementById("btn1").classList.remove("active");
  document.getElementById("btn2").classList.remove("active");
  document.getElementById("btn"+n).classList.add("active");
  render();
}

setInterval(()=>{
  const now=new Date();
  document.getElementById("timeTop").innerText=now.toLocaleTimeString();
  document.getElementById("dateNow").innerText=now.toLocaleDateString();
},1000);
