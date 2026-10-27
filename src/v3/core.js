/* ================= storage ================= */
var KEY="harbor.v1";
var storageOk=true;
var cleanup=null;
var current="home";
var HATS=[["none","No hat"],["party","Party hat"],["crown","Crown"],["sailor","Sailor cap"],["flower","Flower"],["beanie","Beanie"],["shades","Sunglasses"]];
var HATIDS=HATS.map(function(x){return x[0];});

function dayKey(ts){var d=new Date(ts);return d.getFullYear()+"-"+(d.getMonth()<9?"0":"")+(d.getMonth()+1)+"-"+(d.getDate()<10?"0":"")+d.getDate();}
function fresh(){
  return {v:3,intro:false,entries:[],steps:[],jar:[],days:{},goals:{},arrived:{},wishes:[],garden:[],bouquet:0,
    hat:"none",hats:["none","party"],gift:{day:"",item:null},fx:true,still:false,palette:"mood",
    voice:false,voiceName:"",voiceEngine:"heart",voiceRate:0.85,voicePitch:1,breathSound:true,breathVoice:false,sceneSound:true,flung:false,sheep:0,popped:0,palNote:false};
}
function normalize(d){
  var o=fresh();
  if(!d||typeof d!=="object")return o;
  o.intro=!!d.intro;
  if(Array.isArray(d.entries)){
    o.entries=d.entries.filter(function(x){return x&&typeof x.t==="number"&&x.mood>=1&&x.mood<=5;})
      .map(function(x){return {id:String(x.id||x.t),t:x.t,mood:Math.round(x.mood),note:typeof x.note==="string"?x.note:""};});
  }
  if(Array.isArray(d.steps)){
    o.steps=d.steps.filter(function(x){return x&&typeof x.t==="number";})
      .map(function(x){return {t:x.t,text:typeof x.text==="string"?x.text:""};});
  }
  if(Array.isArray(d.jar)){
    o.jar=d.jar.filter(function(x){return x&&typeof x.t==="number"&&typeof x.text==="string"&&x.text;})
      .map(function(x){return {id:String(x.id||x.t),t:x.t,text:x.text};});
  }
  if(d.days&&typeof d.days==="object"){Object.keys(d.days).forEach(function(k){if(/^\d{4}-\d{2}-\d{2}$/.test(k))o.days[k]=1;});}
  o.entries.forEach(function(e){o.days[dayKey(e.t)]=1;});
  o.steps.forEach(function(e){o.days[dayKey(e.t)]=1;});
  o.jar.forEach(function(e){o.days[dayKey(e.t)]=1;});
  if(d.arrived&&typeof d.arrived==="object"){Object.keys(d.arrived).forEach(function(k){if(typeof d.arrived[k]==="number")o.arrived[k]=d.arrived[k];});}
  if(d.goals&&typeof d.goals==="object"){Object.keys(d.goals).forEach(function(k){if(Array.isArray(d.goals[k]))o.goals[k]=d.goals[k].map(function(b){return !!b;});});}
  if(Array.isArray(d.wishes)){
    o.wishes=d.wishes.filter(function(x){return x&&typeof x.text==="string"&&x.text;}).map(function(x){return {id:String(x.id||x.t||Math.random()),t:typeof x.t==="number"?x.t:Date.now(),text:x.text.slice(0,140),done:!!x.done};});
  }
  if(Array.isArray(d.garden)){
    o.garden=d.garden.filter(function(x){return x&&typeof x.kind==="string";}).slice(0,6).map(function(x){return {id:String(x.id||Math.random()),kind:x.kind,name:typeof x.name==="string"?x.name.slice(0,24):"",w:Math.max(0,Math.floor(Number(x.w)||0)),last:typeof x.last==="string"?x.last:""};});
  }
  o.bouquet=typeof d.bouquet==="number"&&d.bouquet>=0?Math.floor(d.bouquet):0;
  o.hat=HATIDS.indexOf(d.hat)>=0?d.hat:"none";
  if(Array.isArray(d.hats)){o.hats=d.hats.filter(function(x){return HATIDS.indexOf(x)>=0;});}
  if(o.hats.indexOf("none")<0)o.hats.unshift("none");
  if(o.hats.indexOf(o.hat)<0)o.hat="none";
  if(d.gift&&typeof d.gift==="object"&&typeof d.gift.day==="string"){
    o.gift={day:d.gift.day,item:d.gift.item&&typeof d.gift.item.text==="string"?{kind:String(d.gift.item.kind||"Gift"),text:d.gift.item.text}:null};
  }
  o.fx=d.fx!==false;
  o.still=!!d.still;
  o.palette=(d.palette==="lift"||d.palette==="soft")?d.palette:"mood";
  o.voice=!!d.voice;
  o.voiceEngine=(d.voiceEngine==="heart"||d.voiceEngine==="emma"||d.voiceEngine==="phone")?d.voiceEngine:"heart";
  o.voiceName=typeof d.voiceName==="string"?d.voiceName:"";
  o.voiceRate=typeof d.voiceRate==="number"&&d.voiceRate>=0.5&&d.voiceRate<=1.3?d.voiceRate:0.8;
  o.voicePitch=typeof d.voicePitch==='number'&&d.voicePitch>=0.5&&d.voicePitch<=1.2?d.voicePitch:1;
  o.breathSound=d.breathSound!==false;
  o.breathVoice=!!d.breathVoice;
  o.sceneSound=d.sceneSound!==false;
  o.flung=!!d.flung;
  o.sheep=typeof d.sheep==="number"&&d.sheep>=0?Math.floor(d.sheep):0;
  o.popped=typeof d.popped==="number"&&d.popped>=0?Math.floor(d.popped):0;
  o.palNote=!!d.palNote;
  return o;
}
function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(raw)return normalize(JSON.parse(raw));
  }catch(e){}
  return fresh();
}
var S=load();
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(S));storageOk=true;}
  catch(e){storageOk=false;}
}
save();
function applyStill(){document.documentElement.setAttribute("data-still",S.still?"1":"0");}
applyStill();

/* ================= colour that follows mood ================= */
/* level: [background hue, background saturation, accent hue, square saturation] */
var PAL={1:[26,44,178,46],2:[24,48,174,48],3:[196,30,176,52],4:[48,62,160,64],5:[42,90,280,80]};
var HUBH={feel:350,calm:200,play:38,grow:140};
var QSAT={feel:0,calm:0,play:6,grow:0};
var hubNow=null;
function isDark(){
  var t=document.documentElement.getAttribute("data-theme");
  if(t==="dark")return true;
  if(t==="light")return false;
  try{return window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){return false;}
}
function moodLevel(){
  var last=null;
  S.entries.forEach(function(e){if(!last||e.t>last.t)last=e;});
  if(!last||Date.now()-last.t>48*3600*1000)return 3;
  return last.mood;
}
function paletteLevel(){
  var m=moodLevel();
  if(S.palette==="soft")return 2;
  if(S.palette==="lift")return Math.min(5,Math.max(2,m+1));
  return m;
}
function hsl(hh,s,l){return "hsl("+Math.round(hh)+" "+Math.round(s)+"% "+Math.round(l)+"%)";}
function clampN(x,a,b){return Math.max(a,Math.min(b,x));}
function palVars(L,hub,dark){
  var p=PAL[L],bh=p[0],bs=p[1],ah=p[2],qs=p[3],v={};
  if(hub&&HUBH[hub]!=null){bh=HUBH[hub];ah=HUBH[hub];bs=Math.max(34,Math.round(qs*.9));}
  var f=qs/55;
  function qc(hh,extra){return dark?hsl(hh,clampN((qs+extra)*.8,16,72),24):hsl(hh,clampN(qs+extra,18,92),hh>=30&&hh<=60?78:83);}
  if(!dark){
    v["--bg"]=hsl(bh,bs,94);v["--surface"]=hsl(bh,bs*.7,98);v["--surface2"]=hsl(bh,bs*.9,89);v["--line"]=hsl(bh,bs*.7,79);
    v["--ink"]=hsl(bh,36,13);v["--muted"]=hsl(bh,18,33);
    v["--accent"]=hsl(ah,58,29);v["--on-accent"]="#FFFFFF";
    v["--lamp-soft"]=hsl(42,clampN(75*f,40,95),86);v["--lamp-ink"]=hsl(38,70,16);v["--lamp"]=hsl(38,78,50);
    v["--pop"]=hsl(10,62,40);v["--pop-soft"]=hsl(12,clampN(70*f,38,92),90);v["--pop-ink"]=hsl(10,60,19);
    v["--sky-soft"]=hsl(205,clampN(62*f,32,90),89);v["--sky-ink"]=hsl(210,55,17);
    v["--help-bg"]=hsl(12,55,90);v["--help-ink"]=hsl(8,60,22);
    v["--q-ink"]=hsl(bh,40,12);v["--ri"]="rgba(255,255,255,.5)";
    v["--pip"]="#3FA7A0";v["--pip-belly"]="#C4EBE5";v["--cloud"]="#FFFFFF";
    v["color-scheme"]="light";
  }else{
    v["--bg"]=hsl(bh,bs*.45,10);v["--surface"]=hsl(bh,bs*.4,14);v["--surface2"]=hsl(bh,bs*.45,19);v["--line"]=hsl(bh,bs*.35,27);
    v["--ink"]=hsl(bh,22,92);v["--muted"]=hsl(bh,14,72);
    v["--accent"]=hsl(ah,50,69);v["--on-accent"]=hsl(ah,45,9);
    v["--lamp-soft"]=hsl(40,38,20);v["--lamp-ink"]=hsl(40,70,86);v["--lamp"]=hsl(38,70,62);
    v["--pop"]=hsl(10,75,70);v["--pop-soft"]=hsl(12,34,21);v["--pop-ink"]=hsl(12,70,88);
    v["--sky-soft"]=hsl(205,36,21);v["--sky-ink"]=hsl(205,60,88);
    v["--help-bg"]=hsl(10,36,21);v["--help-ink"]=hsl(10,70,88);
    v["--q-ink"]=hsl(bh,30,93);v["--ri"]="rgba(255,255,255,.12)";
    v["--pip"]="#4CC0B7";v["--pip-belly"]="#CFEFEA";v["--cloud"]="#B9CCD6";
    v["color-scheme"]="dark";
  }
  v["--q-feel"]=qc(350,0);v["--q-calm"]=qc(200,0);v["--q-play"]=qc(40,6);v["--q-grow"]=qc(140,0);
  if(hub&&HUBH[hub]!=null){
    v["--hubc"]=v["--q-"+hub];v["--hub-ink"]=v["--q-ink"];
  }else{v["--hubc"]=v["--surface2"];v["--hub-ink"]=v["--ink"];}
  return v;
}
function applyPalette(hub){
  if(hub!==undefined)hubNow=hub||null;
  var v=palVars(paletteLevel(),hubNow,isDark()),root=document.documentElement;
  Object.keys(v).forEach(function(k){root.style.setProperty(k,v[k]);});
}
try{
  var mq=window.matchMedia("(prefers-color-scheme: dark)");
  var onMq=function(){applyPalette();};
  if(mq.addEventListener)mq.addEventListener("change",onMq);else if(mq.addListener)mq.addListener(onMq);
}catch(e){}
applyPalette(null);
