const clockEl=document.getElementById("clock");
const dateEl=document.getElementById("date");
const themeToggle=document.getElementById("themeToggle");
const weightEl=document.getElementById("weight");
const stockEl=document.getElementById("stock");
const stokLabel=document.getElementById("stokLabel");
const historyEl=document.getElementById("history");
const fidEl=document.getElementById("fid");
const barStock=document.getElementById("barStock");
const cat=document.getElementById("cat");
const btn1=document.getElementById("btn1");
const btn2=document.getElementById("btn2");

setInterval(()=>{
 const n=new Date();
 clockEl.innerText=n.toLocaleTimeString();
 dateEl.innerText=n.toLocaleDateString("id-ID",{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
},1000);

themeToggle.onclick=()=>{
 document.body.classList.toggle("dark");
 document.body.classList.toggle("light");
 themeToggle.innerText=document.body.classList.contains("dark")?"🌙":"☀️";
};

let current="FEEDER_1",feeders={},lastUID="";

const client=mqtt.connect("wss://1f1fb9c5b684449c8ecce6cc5f320ad5.s1.eu.hivemq.cloud:8884/mqtt",{
 clientId:"web_"+Math.random().toString(16).substr(2,8),
 username:"TugasBesar",password:"Leadtheway23"
});

client.on("connect",()=>client.subscribe("feeder/data"));

client.on("message",(t,m)=>{
 const d=JSON.parse(m.toString());
 if(!feeders[d.feeder_id])feeders[d.feeder_id]={hist:[],weight:0,stock:0};
 const f=feeders[d.feeder_id];
 f.weight=d.weight;
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

 let mood="Banyak",emo="😺";
 if(f.stock<=10){mood="Habis";emo="😵";}
 else if(f.stock<=30){mood="Sedikit";emo="😿";}
 else if(f.stock<=70){mood="Sedang";emo="😸";}
 stokLabel.innerText=mood;
 cat.innerText=emo;

 historyEl.innerHTML="";
 (f.hist||[]).forEach(x=>{
  const li=document.createElement("li");
  li.innerText=x;historyEl.appendChild(li);
 });
}

btn1.onclick=()=>{current="FEEDER_1";btn1.classList.add("active");btn2.classList.remove("active");render();}
btn2.onclick=()=>{current="FEEDER_2";btn2.classList.add("active");btn1.classList.remove("active");render();}
