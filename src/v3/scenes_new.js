
function postcardEl(p,opt){
  opt=opt||{};
  var fig=h("figure",{class:"postcard"});
  fig.innerHTML=SCENES[p.scene]();
  if(S.arrived[p.id])fig.append(h("div",{class:"stamp"},"Been there"));
  if(opt.cap)fig.append(h("figcaption",{class:"cap"},opt.cap));
  return fig;
}
var SCENE=null;
function closeScene(){
  if(!SCENE)return;
  cancelAnimationFrame(SCENE.raf);clearTimeout(SCENE.tm);
  window.removeEventListener("resize",SCENE.onResize);
  stopSpeech();
  SCENE.ov.remove();SCENE=null;
}
function openScene(kind,soundIds){
  closeScene();
  var script=SCRIPTS[kind]||SCRIPTS.night;
  var ov=h("div",{class:"scene",role:"dialog","aria-label":"Calming scene"});
  var cv=h("canvas");
  var line=h("p",{class:"scene-line","aria-live":"off"},"");
  var x=h("button",{class:"scene-x",type:"button","aria-label":"Close scene",onclick:closeScene},"Close");
  var dark=h("div",{class:"scene-dark"},"Tap anywhere to open your eyes");
  var bar=h("div",{class:"scene-bar"});
  ov.append(cv,line,x,dark,bar);
  var voiceOn=!!(S.voice&&VOICE_OK);
  var vb=null,sb=null,eb=null;
  if(VOICE_OK){
    vb=h("button",{type:"button","aria-pressed":voiceOn?"true":"false"},voiceOn?"Voice on":"Voice off");
    vb.addEventListener("click",function(){
      voiceOn=!voiceOn;S.voice=voiceOn;save();
      vb.setAttribute("aria-pressed",voiceOn?"true":"false");vb.textContent=voiceOn?"Voice on":"Voice off";
      clearTimeout(s.tm);stopSpeech();
      s.tm=setTimeout(showLine,700);
    });
    bar.append(vb);
  }
  if(soundIds){
    var playing=anyPlaying();
    sb=h("button",{type:"button","aria-pressed":playing?"true":"false"},playing?"Sound on":"Sound off");
    sb.addEventListener("click",function(){
      if(anyPlaying()){stopAll();sb.setAttribute("aria-pressed","false");sb.textContent="Sound off";}
      else{soundIds.forEach(function(id){startLayer(id);});sb.setAttribute("aria-pressed","true");sb.textContent="Sound on";}
    });
    bar.append(sb);
  }
  eb=h("button",{type:"button"},"Eyes closed");
  eb.addEventListener("click",function(){ov.classList.add("eyes");});
  dark.addEventListener("click",function(){ov.classList.remove("eyes");});
  bar.append(eb);
  document.body.append(ov);
  var ctx=null;try{ctx=cv.getContext("2d");}catch(e){}
  var D=DRAW[kind],st=null,w=0,hgt=0,t0=performance.now();
  function size(){
    var dpr=Math.min(window.devicePixelRatio||1,2);
    w=ov.clientWidth||window.innerWidth;hgt=ov.clientHeight||window.innerHeight;
    cv.width=Math.floor(w*dpr);cv.height=Math.floor(hgt*dpr);
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
    st=D.init(w,hgt);
    if(reduced()&&ctx)D.draw(ctx,w,hgt,2,st);
  }
  size();
  var s={ov:ov,raf:0,tm:0,onResize:size};
  SCENE=s;
  window.addEventListener("resize",size);
  function frame(now){
    if(SCENE!==s)return;
    if(ctx)D.draw(ctx,w,hgt,(now-t0)/1000,st);
    s.raf=requestAnimationFrame(frame);
  }
  if(!reduced())s.raf=requestAnimationFrame(frame);
  var li=0;
  function showLine(){
    if(SCENE!==s)return;
    line.classList.remove("on");
    s.tm=setTimeout(function(){
      if(SCENE!==s)return;
      var txt=script[li%script.length];
      line.textContent=txt;line.classList.add("on");
      li++;
      var gap=li%script.length===0?16000:3800;
      if(voiceOn){
        speak(txt,function(){if(SCENE===s)s.tm=setTimeout(showLine,gap);});
      }else{
        s.tm=setTimeout(showLine,li%script.length===0?16000:8200);
      }
    },1400);
  }
  /* unlock speech inside the tap, then start */
  if(voiceOn&&S.voiceEngine==="phone"&&TTS.ok){try{var u=new SpeechSynthesisUtterance(" ");u.volume=0;window.speechSynthesis.speak(u);}catch(e){}}
  if(voiceOn){ac();prewarm(script);}
  s.tm=setTimeout(showLine,300);
}
