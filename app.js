let feeder = 1;
let stok = 0;
let berat = 0;

const beratEl = document.getElementById("berat");
const stokEl = document.getElementById("stok");
const stokBar = document.getElementById("stokBar");
const moodEl = document.getElementById("catMood");
const moodText = document.getElementById("moodText");
const statusText = document.getElementById("statusText");
const log = document.getElementById("log");
const mqttStatus = document.getElementById("mqttStatus");

document.getElementById("btnF1").onclick=()=>switchFeeder(1);
document.getElementById("btnF2").onclick=()=>switchFeeder(2);

function switchFeeder(n){
  feeder=n;
  document.getElementById("btnF1").classList.toggle("active",n===1);
  document.getElementById("btnF2").classList.toggle("active",n===2);
  document.getElementById("feederTitle").innerText="FEEDER "+n;
}

function updateMood(){
  let mood="😺",text="Banyak";
  if(stok<=0){mood="😿";text="Habis";}
  else if(stok<30){mood="😾";text="Sedikit";}
  else if(stok<70){mood="😸";text="Sedang";}
  moodEl.innerText=mood;
  moodText.innerText=text;
}

function addLog(msg){
  const li=document.createElement("li");
  li.innerText=new Date().toLocaleTimeString()+" - "+msg;
  log.prepend(li);
}

function updateDateTime(){
  const now=new Date();
  document.getElementById("datetime").innerText=
    now.toLocaleTimeString("id-ID")+" "+now.toLocaleDateString("id-ID");
}
setInterval(updateDateTime,1000);updateDateTime();

document.getElementById("themeToggle").onclick=()=>{
  document.body.classList.toggle("light");
};

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

client.on("connect",()=>{
  mqttStatus.innerText="CONNECTED";
  statusText.innerText="Online";
  client.subscribe("smartcat/feeder"+feeder+"/stok");
  client.subscribe("smartcat/feeder"+feeder+"/berat");
});

client.on("message",(topic,msg)=>{
  const val=parseFloat(msg.toString());
  if(topic.includes("stok")){
    stok=parseFloat(val.toFixed(2));
    stokEl.innerText=stok;
    stokBar.value=stok;
    updateMood();
    addLog("Stok "+stok+"%");
    if(stok<=0) alert("⚠️ MAKANAN HABIS!");
  }
  if(topic.includes("berat")){
    berat=val.toFixed(2);
    beratEl.innerText=berat;
    addLog("Berat "+berat+"g");
  }
});
