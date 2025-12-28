const statusBox = document.getElementById("status");
const weightEl = document.getElementById("weight");
const stockEl  = document.getElementById("stock");
const stokLabelEl = document.getElementById("stokLabel");
const historyEl = document.getElementById("history");
const fidEl = document.getElementById("fid");
const barStock = document.getElementById("barStock");
const clockEl = document.getElementById("clock");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const rfidChart = document.getElementById("rfidChart");
const catEl = document.querySelector(".cat");

let current = "FEEDER_1";
let feeders = {};
let chart;

const client = mqtt.connect(
 "wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",
 {
  clientId: "web_" + Math.random().toString(16).substr(2,8),
  username: "TugasBesar",
  password: "Leadtheway23",
  protocol: "wss",
  reconnectPeriod: 2000,
  clean:true
 }
);

client.on("connect",()=>{
 setStatus("CONNECTED",true);
 client.subscribe("feeder/data");
});
client.on("offline",()=>setStatus("DISCONNECTED",false));
client.on("error",e=>console.error("MQTT ERROR:",e));

client.on("message",(t,m)=>{
 const d = JSON.parse(m.toString());
 feeders[d.feeder_id] ||= {hist:[], chart:[], lastUID:"", rfidState:0};
 let f = feeders[d.feeder_id];

 f.weight = d.weight;
 f.stock  = d.distance > 10 ? 0 : Math.round((10 - d.distance) * 10);

 // RFID DIGITAL SIGNAL
 if(d.uid && d.uid !== "" && d.uid !== f.lastUID){
   f.lastUID = d.uid;
   f.rfidState = 1;
   let tm = new Date().toLocaleTimeString();
   f.hist.unshift("⏰ "+tm+" - "+d.uid);
   f.chart.push({time:tm, val:1});
 }

 if(!d.uid && f.rfidState === 1){
   f.rfidState = 0;
   let tm = new Date().toLocaleTimeString();
   f.chart.push({time:tm, val:0});
   f.lastUID="";
 }

 if(d.feeder_id === current) render();
});

function stokText(p){
 if(p<=10) return "🚨 Makanan Habis";
 if(p<=30) return "😿 Sudah Mau Habis";
 if(p<=70) return "😸 Stok Sedang";
 return "😺 Masih Banyak";
}

function render(){
 let f = feeders[current]||{};
 fidEl.innerText=current;
 weightEl.innerText=(f.weight||0).toFixed(1);
 stockEl.innerText=f.stock||0;
 stokLabelEl.innerText=stokText(f.stock||0);
 barStock.style.width=(f.stock||0)+"%";

 catEl.innerText = (f.stock||0)<=10?"😿":(f.stock||0)<=30?"😾":"😺";

 historyEl.innerHTML="";
 (f.hist||[]).slice(0,5).forEach(x=>{
  let li=document.createElement("li");li.innerText=x;historyEl.appendChild(li);
 });

 drawChart(f.chart||[]);
}

function showFeeder(n){
 current="FEEDER_"+n;
 btn1.classList.remove("active");
 btn2.classList.remove("active");
 document.getElementById("btn"+n).classList.add("active");
 render();
}

function drawChart(data){
 if(chart) chart.destroy();
 chart = new Chart(rfidChart,{
  type:"line",
  data:{
    labels:data.map(x=>x.time),
    datasets:[{
      label:"RFID Signal",
      data:data.map(x=>x.val),
      stepped:true,
      borderWidth:2,
      fill:false
    }]
  },
  options:{
    animation:false,
    scales:{ y:{min:-0.2,max:1.2,ticks:{stepSize:1}} }
  }
 });
}

function setStatus(t,on){
 statusBox.innerText=t;
 statusBox.className="status "+(on?"connected":"disconnected");
}

setInterval(()=>clockEl.innerText=new Date().toLocaleTimeString(),1000);
