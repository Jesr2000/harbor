/* ================= audio engine ================= */
var AE={ctx:null,master:null,duckG:null,voiceG:null,cur:null,revIn:null,noise:{},layers:{},vol:{},sleepAt:0,sleepT:null,fadeT:null};
function makeIR(ctx,sec,decay){
  var len=Math.floor(ctx.sampleRate*sec),buf=ctx.createBuffer(2,len,ctx.sampleRate),ch,i,y,d;
  for(ch=0;ch<2;ch++){
    d=buf.getChannelData(ch);y=0;
    for(i=0;i<len;i++){
      y+=((Math.random()*2-1)-y)*0.42;
      d[i]=y*Math.pow(1-i/len,decay)*(i<200?i/200:1);
    }
  }
  return buf;
}
function ac(){
  if(!AE.ctx){
    var C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;
    try{AE.ctx=new C();}catch(e){return null;}
    var ctx=AE.ctx,comp=ctx.createDynamicsCompressor();
    AE.master=ctx.createGain();AE.master.gain.value=0.85;
    AE.duckG=ctx.createGain();AE.duckG.gain.value=1;
    AE.master.connect(AE.duckG);AE.duckG.connect(comp);comp.connect(ctx.destination);
    AE.voiceG=ctx.createGain();AE.voiceG.gain.value=1;AE.voiceG.connect(comp);
    try{
      AE.revIn=ctx.createGain();
      var conv=ctx.createConvolver();conv.buffer=makeIR(ctx,3.4,2.6);
      var wet=ctx.createGain();wet.gain.value=0.8;
      AE.revIn.connect(conv);conv.connect(wet);wet.connect(AE.master);
    }catch(e){AE.revIn=null;}
  }
  if(AE.ctx.state==="suspended"){try{AE.ctx.resume();}catch(e){}}
  return AE.ctx;
}
function duck(on){
  if(!AE.ctx||!AE.duckG)return;
  try{AE.duckG.gain.setTargetAtTime(on?0.4:1,AE.ctx.currentTime,0.35);}catch(e){}
}
function noiseBuf(ctx,type){
  if(AE.noise[type])return AE.noise[type];
  var len=Math.floor(ctx.sampleRate*5),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
  var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0,i,w;
  for(i=0;i<len;i++){
    w=Math.random()*2-1;
    if(type==="white"){d[i]=w;}
    else if(type==="pink"){
      b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.969*b2+w*0.153852;
      b3=0.8665*b3+w*0.3104856;b4=0.55*b4+w*0.5329522;b5=-0.7616*b5-w*0.016898;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926;
    }else{last=(last+0.02*w)/1.02;d[i]=last*3.5;}
  }
  /* cross-fade the ends so the loop has no click */
  var fade=Math.floor(ctx.sampleRate*0.25);
  for(i=0;i<fade;i++){var a=i/fade;d[i]=d[i]*a+d[len-fade+i]*(1-a);}
  AE.noise[type]=buf;
  return buf;
}
function loopNoise(ctx,type){
  var s=ctx.createBufferSource();s.buffer=noiseBuf(ctx,type);s.loop=true;
  s.loopStart=0;s.loopEnd=s.buffer.duration-0.25;
  s.playbackRate.value=0.92+Math.random()*0.16;
  s.start(0,Math.random()*3);return s;
}
function bq(ctx,type,f,q){var b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;return b;}
function gn(ctx,v){var g=ctx.createGain();g.gain.value=v;return g;}
function lfo(ctx,freq,depth,param){
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.value=freq;g.gain.value=depth;o.connect(g);g.connect(param);o.start();
  return o;
}
function panner(ctx,v){
  if(!ctx.createStereoPanner)return null;
  var p=ctx.createStereoPanner();p.pan.value=v;return p;
}
function repeat(fn,minMs,maxMs,firstMs){
  var t=null,dead=false;
  function go(){if(dead)return;try{fn();}catch(e){}t=setTimeout(go,rnd(minMs,maxMs));}
  t=setTimeout(go,firstMs==null?rnd(minMs,maxMs):firstMs);
  return {stop:function(){dead=true;clearTimeout(t);}};
}
function voice(ctx,dest,freq,dur,type,vol,delay,pan){
  var t=ctx.currentTime+(delay||0),o=ctx.createOscillator(),g=ctx.createGain(),end=g,p=null;
  o.type=type||"sine";o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(vol||0.1,t+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);
  if(pan!=null){p=panner(ctx,pan);if(p){g.connect(p);end=p;}}
  end.connect(dest);o.start(t);o.stop(t+dur+0.05);
}
function ping(ctx,dest,f,vol,dur,q){
  var t=ctx.currentTime,s=ctx.createBufferSource(),b=bq(ctx,"bandpass",f,q||3),g=ctx.createGain();
  s.buffer=noiseBuf(ctx,"white");
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(b);b.connect(g);g.connect(dest);s.start(t,Math.random()*3);s.stop(t+dur+0.05);
}
function stopAny(list){list.forEach(function(x){try{x.stop();}catch(e){}});}
var PENTA=[523.25,587.33,659.25,783.99,880,1046.5];
var LAYERS=[
  {id:"ocean",name:"Ocean waves",desc:"Slow swells rolling in and out",def:.7,wet:.18,make:function(ctx,out){
    var pn=panner(ctx,0),o=out;
    if(pn){pn.connect(out);o=pn;}
    var n1=loopNoise(ctx,"brown"),lp=bq(ctx,"lowpass",520,.7),g=gn(ctx,.42);
    n1.connect(lp);lp.connect(g);g.connect(o);
    var a=[lfo(ctx,.071,.26,g.gain),lfo(ctx,.113,.1,g.gain),lfo(ctx,.071,320,lp.frequency)];
    var n2=loopNoise(ctx,"pink"),bp=bq(ctx,"bandpass",1700,.6),g2=gn(ctx,.04);
    n2.connect(bp);bp.connect(g2);g2.connect(o);
    var b=[lfo(ctx,.071,.032,g2.gain),lfo(ctx,.137,.012,g2.gain),lfo(ctx,.09,600,bp.frequency)];
    var n3=loopNoise(ctx,"white"),hp=bq(ctx,"highpass",4500,.5),g3=gn(ctx,.012);
    n3.connect(hp);hp.connect(g3);g3.connect(o);
    var c=[lfo(ctx,.071,.01,g3.gain)];
    var pl=pn?lfo(ctx,.05,.5,pn.pan):null;
    return function(){stopAny([n1,n2,n3,pl].concat(a,b,c));};
  }},
  {id:"rain",name:"Soft rain",desc:"Steady rain on leaves",def:.65,wet:.22,make:function(ctx,out){
    var n=loopNoise(ctx,"pink"),hp=bq(ctx,"highpass",800,.5),lp=bq(ctx,"lowpass",7500,.5),g=gn(ctx,.34);
    n.connect(hp);hp.connect(lp);lp.connect(g);g.connect(out);
    var l1=lfo(ctx,.07,.04,g.gain);
    var n2=loopNoise(ctx,"brown"),lp2=bq(ctx,"lowpass",260,.6),g2=gn(ctx,.14);
    n2.connect(lp2);lp2.connect(g2);g2.connect(out);
    var drops=repeat(function(){ping(ctx,out,rnd(1800,5200),rnd(.025,.07),rnd(.018,.05),4);},55,190,100);
    return function(){drops.stop();stopAny([n,n2,l1]);};
  }},
  {id:"wind",name:"Gentle wind",desc:"A breeze moving through trees",def:.5,wet:.1,make:function(ctx,out){
    var pn=panner(ctx,0),o=out;
    if(pn){pn.connect(out);o=pn;}
    var n=loopNoise(ctx,"pink"),bp=bq(ctx,"bandpass",480,.9),g=gn(ctx,.22);
    n.connect(bp);bp.connect(g);g.connect(o);
    var a=[lfo(ctx,.043,230,bp.frequency),lfo(ctx,.067,.1,g.gain),lfo(ctx,.11,.05,g.gain)];
    var n2=loopNoise(ctx,"white"),bp2=bq(ctx,"bandpass",2400,2),g2=gn(ctx,.006);
    n2.connect(bp2);bp2.connect(g2);g2.connect(o);
    var b=[lfo(ctx,.05,.005,g2.gain),lfo(ctx,.037,500,bp2.frequency)];
    var pl=pn?lfo(ctx,.031,.6,pn.pan):null;
    return function(){stopAny([n,n2,pl].concat(a,b));};
  }},
  {id:"fire",name:"Crackling fire",desc:"A warm hearth, close by",def:.55,wet:.05,make:function(ctx,out){
    var n=loopNoise(ctx,"brown"),lp=bq(ctx,"lowpass",420,.6),g=gn(ctx,.2);
    n.connect(lp);lp.connect(g);g.connect(out);
    var a=[lfo(ctx,.3,.05,g.gain),lfo(ctx,.13,120,lp.frequency)];
    var crack=repeat(function(){
      ping(ctx,out,rnd(1800,6500),rnd(.03,.1),rnd(.01,.04),5);
      if(Math.random()<.18)ping(ctx,out,rnd(700,1200),rnd(.08,.16),rnd(.04,.09),2);
    },60,420,80);
    return function(){crack.stop();stopAny([n].concat(a));};
  }},
  {id:"night",name:"Night crickets",desc:"A warm night, far from anything",def:.5,wet:.25,make:function(ctx,out){
    var n=loopNoise(ctx,"pink"),lp=bq(ctx,"lowpass",340,.5),g=gn(ctx,.08);
    n.connect(lp);lp.connect(g);g.connect(out);
    var l=lfo(ctx,.1,.05,g.gain);
    function chirp(base,pan){
      return repeat(function(){
        var k,f=base+rnd(-100,100),pulses=3+Math.floor(Math.random()*3);
        for(k=0;k<pulses;k++)voice(ctx,out,f,0.05,"sine",0.012,k*0.065,pan);
      },900,2300);
    }
    var c1=chirp(4300,-.5),c2=chirp(4750,.5),c3=chirp(3900,0);
    return function(){c1.stop();c2.stop();c3.stop();stopAny([n,l]);};
  }},
  {id:"chimes",name:"Wind chimes",desc:"Soft bells drifting by",def:.5,wet:.7,make:function(ctx,out){
    var r=repeat(function(){
      var f=pick(PENTA)*(Math.random()<.25?.5:1),pan=rnd(-.6,.6);
      voice(ctx,out,f,4.2,"sine",0.06,0,pan);voice(ctx,out,f*2.01,2.6,"sine",0.014,0,pan);voice(ctx,out,f*3.98,1.2,"sine",0.005,0,pan);
      if(Math.random()<.3){var f2=pick(PENTA);voice(ctx,out,f2,3.6,"sine",0.045,0.7,pan);}
    },2200,6200,500);
    return function(){r.stop();};
  }},
  {id:"bowl",name:"Singing bowl",desc:"A long, soft ring now and then",def:.5,wet:.8,make:function(ctx,out){
    var r=repeat(function(){
      var f=pick([174.6,196,220,246.94]);
      voice(ctx,out,f,11,"sine",0.1);voice(ctx,out,f+1.3,11,"sine",0.07);
      voice(ctx,out,f*2.71,7,"sine",0.03);voice(ctx,out,f*5.4,3.5,"sine",0.01);
    },14000,21000,400);
    return function(){r.stop();};
  }},
  {id:"pad",name:"Warm hum",desc:"A slow, low lullaby chord",def:.4,wet:.5,make:function(ctx,out){
    var lp=bq(ctx,"lowpass",800,.5),g=gn(ctx,.07),oscs=[],freqs=[65.41,98,130.81,196,293.66,329.63];
    lp.connect(g);g.connect(out);
    freqs.forEach(function(f,i){
      var o=ctx.createOscillator(),og=ctx.createGain();
      o.type="sine";o.frequency.value=f;o.detune.value=(i-2.5)*4;og.gain.value=i<2?.6:.4;
      o.connect(og);og.connect(lp);o.start();oscs.push(o);
    });
    oscs.push(lfo(ctx,.06,.03,g.gain),lfo(ctx,.04,260,lp.frequency));
    return function(){stopAny(oscs);};
  }}
];
var LAYER={};LAYERS.forEach(function(l){LAYER[l.id]=l;});
function layerOn(id){return !!AE.layers[id];}
function anyPlaying(){return Object.keys(AE.layers).length>0;}
function startLayer(id,vol){
  var ctx=ac();
  if(!ctx){say("Sound is not available in this browser");return false;}
  if(AE.layers[id])return true;
  if(AE.master)AE.master.gain.setTargetAtTime(0.85,ctx.currentTime,0.05);
  var v=vol!=null?vol:(AE.vol[id]!=null?AE.vol[id]:LAYER[id].def);
  AE.vol[id]=v;
  var g=ctx.createGain();g.gain.value=0.0001;g.connect(AE.master);
  var send=null;
  if(AE.revIn){send=ctx.createGain();send.gain.value=LAYER[id].wet||0.2;g.connect(send);send.connect(AE.revIn);}
  g.gain.setTargetAtTime(v,ctx.currentTime,0.8);
  var stop=LAYER[id].make(ctx,g);
  AE.layers[id]={g:g,send:send,stop:stop};
  updateSoundPill();
  return true;
}
function stopLayer(id){
  var L=AE.layers[id];if(!L)return;
  var ctx=AE.ctx;
  try{L.g.gain.setTargetAtTime(0.0001,ctx.currentTime,0.3);}catch(e){}
  delete AE.layers[id];
  setTimeout(function(){try{L.stop();L.g.disconnect();if(L.send)L.send.disconnect();}catch(e){}},1800);
  updateSoundPill();
}
function stopAll(){Object.keys(AE.layers).forEach(stopLayer);}
function setVol(id,v){
  AE.vol[id]=v;
  var L=AE.layers[id];
  if(L&&AE.ctx)L.g.gain.setTargetAtTime(v,AE.ctx.currentTime,0.08);
}
function setSleep(min){
  clearTimeout(AE.sleepT);clearTimeout(AE.fadeT);
  if(AE.ctx&&AE.master)AE.master.gain.setTargetAtTime(0.85,AE.ctx.currentTime,0.1);
  if(!min){AE.sleepAt=0;return;}
  AE.sleepAt=Date.now()+min*60000;
  AE.sleepT=setTimeout(function(){
    if(AE.ctx&&AE.master)AE.master.gain.setTargetAtTime(0.0001,AE.ctx.currentTime,3);
    AE.fadeT=setTimeout(function(){stopAll();AE.sleepAt=0;},10000);
  },min*60000);
}
function updateSoundPill(){
  var b=document.getElementById("btnSound");if(!b)return;
  b.hidden=!anyPlaying();
  var t=b.querySelector(".t");
  if(t){var left=AE.sleepAt-Date.now();t.textContent=(AE.sleepAt&&left>0)?Math.floor(left/60000)+":"+("0"+(Math.floor(left/1000)%60)).slice(-2):"Sound";}
}
setInterval(updateSoundPill,1000);
function tone(freq,dur,type,vol,delay){
  if(!S.fx)return;
  var ctx=ac();if(!ctx)return;
  voice(ctx,AE.master,freq,dur,type,vol,delay);
}
function sweep(f0,f1,dur,type,vol){
  if(!S.fx)return;
  var ctx=ac();if(!ctx)return;
  var t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type||"triangle";o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.1,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(AE.master);o.start(t);o.stop(t+dur+0.05);
}
function whoosh(dur){
  if(!S.fx)return;
  var ctx=ac();if(!ctx)return;
  var t=ctx.currentTime,s=ctx.createBufferSource(),b=bq(ctx,"bandpass",400,1.2),g=ctx.createGain();
  s.buffer=noiseBuf(ctx,"pink");
  b.frequency.setValueAtTime(300,t);b.frequency.exponentialRampToValueAtTime(2600,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.16,t+dur*.4);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(b);b.connect(g);g.connect(AE.master);s.start(t,Math.random()*3);s.stop(t+dur+0.05);
}
function sfx(k){
  if(k==="boop"){tone(380,0.16,"sine",0.12);tone(560,0.12,"sine",0.08,0.05);}
  else if(k==="pop"){tone(rnd(650,900),0.07,"triangle",0.1);tone(1200,0.05,"sine",0.05,0.02);}
  else if(k==="done"){[523,659,784].forEach(function(f,j){tone(f,0.5,"sine",0.1,j*0.09);});}
  else if(k==="sparkle"){[1047,1319,1568,2093].forEach(function(f,j){tone(f,0.6,"sine",0.06,j*0.07);});}
  else if(k==="fanfare"){[523,659,784,1047].forEach(function(f,j){tone(f,0.9,"triangle",0.1,j*0.14);});}
  else if(k==="bowl"){tone(220,5,"sine",0.1);tone(607,3,"sine",0.03);}
  else if(k==="tick"){tone(900,0.05,"square",0.02);}
  else if(k==="twang"){sweep(720,150,0.32,"triangle",0.16);tone(180,0.25,"sine",0.1);}
  else if(k==="boing"){sweep(180,420,0.28,"sine",0.14);tone(520,0.2,"triangle",0.05,0.12);}
  else if(k==="stretch"){}
  else if(k==="baa"){sweep(330,240,0.45,"sawtooth",0.03);}
  else if(k==="splash"){whoosh(0.4);}
}
/* a soft plucked string, used by the harp */
function pluck(freq,vol){
  var ctx=ac();if(!ctx)return;
  var dest=ctx.createGain();dest.gain.value=1;dest.connect(AE.master);
  if(AE.revIn){var s=ctx.createGain();s.gain.value=.5;dest.connect(s);s.connect(AE.revIn);}
  voice(ctx,dest,freq,2.4,"triangle",vol||.08);voice(ctx,dest,freq*2,1.4,"sine",(vol||.08)*.35);voice(ctx,dest,freq*3,.6,"sine",(vol||.08)*.1);
  setTimeout(function(){try{dest.disconnect();}catch(e){}},3200);
}
/* breathing sounds: a rising tone with an airy swell for the inhale,
   a different, falling and darker tone for the exhale */
function breathSound(kind,secs){
  var ctx=ac();if(!ctx)return null;
  var t=ctx.currentTime,up=kind==="in",out=ctx.createGain();
  out.gain.value=1;out.connect(AE.master);
  if(AE.revIn){var sd=ctx.createGain();sd.gain.value=.25;out.connect(sd);sd.connect(AE.revIn);}
  var o=ctx.createOscillator(),g=ctx.createGain(),o2=ctx.createOscillator(),g2=ctx.createGain();
  o.type=up?"triangle":"sine";o2.type="sine";
  var f0=up?196:330,f1=up?330:196;
  o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f1,t+secs);
  o2.frequency.setValueAtTime(f0*1.5,t);o2.frequency.linearRampToValueAtTime(f1*1.5,t+secs);
  g.gain.setValueAtTime(0.0001,t);g2.gain.setValueAtTime(0.0001,t);
  if(up){
    g.gain.exponentialRampToValueAtTime(0.07,t+secs*.55);g.gain.exponentialRampToValueAtTime(0.03,t+secs*.95);g.gain.exponentialRampToValueAtTime(0.0001,t+secs);
    g2.gain.exponentialRampToValueAtTime(0.02,t+secs*.7);g2.gain.exponentialRampToValueAtTime(0.0001,t+secs);
  }else{
    g.gain.exponentialRampToValueAtTime(0.065,t+.4);g.gain.exponentialRampToValueAtTime(0.0001,t+secs);
    g2.gain.exponentialRampToValueAtTime(0.012,t+.5);g2.gain.exponentialRampToValueAtTime(0.0001,t+secs*.8);
  }
  o.connect(g);g.connect(out);o2.connect(g2);g2.connect(out);
  var ns=ctx.createBufferSource(),bp=bq(ctx,"bandpass",up?500:1500,1.1),ng=ctx.createGain();
  ns.buffer=noiseBuf(ctx,"pink");ns.loop=true;
  bp.frequency.setValueAtTime(up?500:1500,t);bp.frequency.linearRampToValueAtTime(up?1700:420,t+secs);
  ng.gain.setValueAtTime(0.0001,t);
  if(up){ng.gain.exponentialRampToValueAtTime(0.08,t+secs*.9);ng.gain.exponentialRampToValueAtTime(0.0001,t+secs);}
  else{ng.gain.exponentialRampToValueAtTime(0.09,t+.5);ng.gain.exponentialRampToValueAtTime(0.0001,t+secs);}
  ns.connect(bp);bp.connect(ng);ng.connect(out);
  o.start(t);o2.start(t);ns.start(t,Math.random()*3);
  var endT=t+secs+.1;o.stop(endT);o2.stop(endT);ns.stop(endT);
  var done=false;
  return {stop:function(){
    if(done)return;done=true;
    try{
      var n=ctx.currentTime;
      out.gain.cancelScheduledValues(n);out.gain.setValueAtTime(out.gain.value,n);out.gain.linearRampToValueAtTime(0.0001,n+.12);
      o.stop(n+.2);o2.stop(n+.2);ns.stop(n+.2);
    }catch(e){}
  }};
}

/* ---- reading aloud (the voice comes from the phone itself) ---- */
var TTS={ok:false,voices:[]};
var VOICE_OK=!!(window.AudioContext||window.webkitAudioContext);
try{TTS.ok=("speechSynthesis" in window)&&typeof SpeechSynthesisUtterance!=="undefined";}catch(e){}
if(TTS.ok)VOICE_OK=true;
function loadVoices(){if(!TTS.ok)return;try{TTS.voices=window.speechSynthesis.getVoices()||[];}catch(e){}}
if(TTS.ok){loadVoices();try{window.speechSynthesis.addEventListener("voiceschanged",loadVoices);}catch(e){}}
function englishVoices(){return TTS.voices.filter(function(v){return /^en/i.test(v.lang);});}
function voiceScore(v){
  var n=v.name,sc=0;
  if(/natural|neural|online/i.test(n))sc+=60;
  if(/premium|enhanced|siri/i.test(n))sc+=50;
  if(/samantha|ava|allison|susan|serena|moira|karen|tessa|libby|sonia|aria|jenny|emma|nicky|joanna|salli|kendra|ivy|amy|ruth|stephen/i.test(n))sc+=30;
  if(/female|woman/i.test(n))sc+=15;
  if(/google/i.test(n))sc+=10;
  if(/compact|espeak|novelty|zarvox|fred|ralph|whisper|bad|bells|boing|junior|albert/i.test(n))sc-=80;
  if(/^en-(GB|AU|IE|ZA)/i.test(v.lang))sc+=4;
  if(v.localService)sc+=2;
  return sc;
}
function bestVoice(){
  /* empty name = the phone's own default voice, the one set in its text-to-speech settings */
  if(S.voiceName){for(var i=0;i<TTS.voices.length;i++){if(TTS.voices[i].name===S.voiceName)return TTS.voices[i];}}
  return null;
}
var speakGen=0;
/* ---- recorded neural voices (bundled in the app) ---- */
var CLIPBUF={};
function clipKey(eng,text){var i=VLINES.indexOf(text);return i<0?null:eng+":"+i;}
function haveClip(text){return !!(VCLIPS&&S.voiceEngine!=="phone"&&VCLIPS[S.voiceEngine]&&VLINES.indexOf(text)>=0);}
function loadClip(eng,text,cb){
  var k=clipKey(eng,text);
  if(!k||!VCLIPS[eng]){cb(null);return;}
  if(CLIPBUF[k]){cb(CLIPBUF[k]);return;}
  var ctx=ac();if(!ctx){cb(null);return;}
  try{
    var bin=atob(VCLIPS[eng][VLINES.indexOf(text)]),n=bin.length,bytes=new Uint8Array(n),i;
    for(i=0;i<n;i++)bytes[i]=bin.charCodeAt(i);
    var done=false,ok=function(buf){if(done)return;done=true;CLIPBUF[k]=buf;cb(buf);},bad=function(){if(done)return;done=true;cb(null);};
    var pr=ctx.decodeAudioData(bytes.buffer,ok,bad);
    if(pr&&pr.catch)pr.catch(bad);
  }catch(e){cb(null);}
}
function prewarm(texts){texts.forEach(function(t){if(haveClip(t))loadClip(S.voiceEngine,t,function(){});});}
function speakClip(text,onend){
  var gen=++speakGen,fired=false;
  function fin(){if(fired)return;fired=true;if(gen===speakGen){AE.cur=null;duck(false);if(onend)onend();}}
  loadClip(S.voiceEngine,text,function(buf){
    if(gen!==speakGen)return;
    if(!buf){speakPhone(text,onend);return;}
    var ctx=AE.ctx,src=ctx.createBufferSource(),g=ctx.createGain();
    src.buffer=buf;g.gain.value=1.15;
    src.connect(g);g.connect(AE.voiceG);
    if(AE.revIn){var sd=ctx.createGain();sd.gain.value=.12;g.connect(sd);sd.connect(AE.revIn);}
    src.onended=fin;
    AE.cur=src;duck(true);
    try{src.start();}catch(e){fin();}
    setTimeout(fin,buf.duration*1000+800);
  });
}
function speak(text,onend){
  if(haveClip(text)){ac();speakClip(text,onend);return;}
  speakPhone(text,onend);
}
function speakPhone(text,onend){
  var fired=false,gen=++speakGen;
  function fin(){if(fired)return;fired=true;if(gen===speakGen)duck(false);if(onend&&gen===speakGen)onend();}
  if(!TTS.ok){setTimeout(fin,50);return;}
  try{
    var u=new SpeechSynthesisUtterance(text),v=bestVoice();
    if(v){u.voice=v;u.lang=v.lang;}else{u.lang=(navigator.language||"en-US");}
    u.rate=S.voiceRate;u.pitch=S.voicePitch;u.volume=0.85;
    u.onstart=function(){if(gen===speakGen)duck(true);};
    u.onend=fin;u.onerror=fin;
    window.speechSynthesis.speak(u);
    setTimeout(fin,Math.max(4000,text.length*130/S.voiceRate+3000));
  }catch(e){setTimeout(fin,50);}
}
function stopSpeech(){
  speakGen++;
  if(AE.cur){try{AE.cur.onended=null;AE.cur.stop();}catch(e){}AE.cur=null;}
  if(TTS.ok){try{window.speechSynthesis.cancel();}catch(e){}}
  duck(false);
}
