const clockEl=document.getElementById("clock");
const dateEl=document.getElementById("date");
setInterval(()=>{
  const d=new Date();
  clockEl.innerText=d.toLocaleTimeString();
  dateEl.innerText=d.toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
},1000);

const themeBtn=document.getElementById("themeToggle");
themeBtn.onclick=()=>{
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeBtn.innerText=document.body.classList.contains("dark")?"🌙":"☀️";
};

const weightEl=document.getElementById("weight");
const stockEl=document.getElementById("stock");
const stokLabel=document.getElementById("stokLabel");
const barStock=document.getElementById("barStock");
const cat=document.getElementById("cat");
const historyEl=document.getElementById("history");

let feeders={},current="FEEDER_1",lastUID="";

const client=mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
client.on("connect",()=>client.subscribe("feeder/data"));

client.on("message",(t,m)=>{
  const d=JSON.parse(m.toString());
  feeders[d.feeder_id] ||= {hist:[]};

  let f=feeders[d.feeder_id];
  f.weight=d.weight||0;
  f.stock=Math.max(0,100-(d.distance||10)*10);

  if(d.uid && d.uid!==lastUID){
    lastUID=d.uid;
    f.hist.unshift(`⏰ ${new Date().toLocaleTimeString()} - ${d.uid}`);
    if(f.hist.length>6)f.hist.pop();
    cat.classList.add("eat");
    setTimeout(()=>cat.classList.remove("eat"),500);
  }
  render();
});

function render(){
  let f=feeders[current]||{};
  weightEl.innerText=f.weight?.toFixed(1)||0;
  stockEl.innerText=f.stock?.toFixed(2)||0;
  barStock.style.width=(f.stock||0)+"%";

  let mood="Banyak",emoji="😺";
  if(f.stock<=10){mood="Habis";emoji="😵"}
  else if(f.stock<=30){mood="Sedikit";emoji="😿"}
  else if(f.stock<=70){mood="Sedang";emoji="😸"}
  stokLabel.innerText=mood;
  cat.innerText=emoji;

  historyEl.innerHTML="";
  (f.hist||[]).forEach(h=>{
    let li=document.createElement("li");
    li.innerText=h;
    historyEl.appendChild(li);
  });
}
