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

// ==== STATE ====
let current = "FEEDER_1";
let feeders = {};
let lastUID = "";
let lastTapTime = 0;

// ==== MQTT CONNECT ====
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
  statusBox.className="status connected";
  client.subscribe("feeder/data");
});

// ==== MQTT MESSAGE ====
client.on("message",(topic,msg)=>{
  const d = JSON.parse(msg.toString());
  if(!feeders[d.feeder_id]){
    feeders[d.feeder_id]={hist:[],chart:{},weight:0,stock:0};
  }
  const f = feeders[d.feeder_id];

  f.weight = d.weight;

  // ===== STOCK PERCENTAGE (2 decimal) =====
  let percent = d.distance > 10 ? 0 : (10 - d.distance) * 10;
  f.stock = parseFloat(percent.toFixed(2)); // << 2 digit belakang koma

  // ===== RFID TAP DETECTION =====
  if(d.uid && d.uid !== "" && d.uid !== lastUID){
    lastUID = d.uid;
    lastTapTime = Date.now();

    const tm = new Date().toLocaleTimeString();
    f.hist.unshift(`⏰ ${tm} - ${d.uid}`);
    if(f.hist.length > 8) f.hist.pop();

    cat.classList.add("eat");
    setTimeout(()=>cat.classList.remove("eat"),600);
  }

  // reset UID jika sudah tidak tap
  if(Date.now() - lastTapTime > 2000){
    lastUID = "";
  }

  if(d.feeder_id === current) render();
});

// ==== UI RENDER ====
function render(){
  const f = feeders[current] || {};
  fidEl.innerText = current;
  weightEl.innerText = (f.weight || 0).toFixed(1);
  stockEl.innerText  = (f.stock || 0).toFixed(2); // << tampil 2 digit
  barStock.style.width = (f.stock || 0) + "%";

  // ==== MOOD ====
  let moodText="Banyak", emoji="😺";
  if(f.stock <= 10){ moodText="Habis"; emoji="😵"; }
  else if(f.stock <= 30){ moodText="Sedikit"; emoji="😿"; }
  else if(f.stock <= 70){ moodText="Sedang"; emoji="😸"; }

  stokLabel.innerText = moodText;
  cat.innerText = emoji;

  // ==== RIWAYAT TAP ====
  historyEl.innerHTML="";
  (f.hist||[]).forEach(x=>{
    const li=document.createElement("li");
    li.innerText=x;
    historyEl.appendChild(li);
  });
}

// ==== SWITCH FEEDER ====
btn1.onclick=()=>switchFeeder(1);
btn2.onclick=()=>switchFeeder(2);
function switchFeeder(n){
  current="FEEDER_"+n;
  btn1.classList.remove("active");
  btn2.classList.remove("active");
  document.getElementById("btn"+n).classList.add("active");
  render();
}
