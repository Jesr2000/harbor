
/* ================= CALM ================= */
function viewCalm(){
  return hubView("Calm","Nothing to do and nothing to finish.",[
    {icon:"breathe",title:"Breathe",sub:"A slow guide, with soft sounds",to:"breathe"},
    {icon:"sounds",title:"Sounds",sub:"Rain, waves, fire, wind",to:"sounds"},
    {icon:"scenes",title:"Scenes",sub:"Moving light, read to you",to:"scenes"},
    {icon:"guided",title:"Guided",sub:"Short sessions with a voice",to:"guided"}
  ]);
}

/* ---- sounds ---- */
function viewSounds(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Sounds","Mix your own. Sound keeps playing while you move around the app, and your phone's volume buttons work too."));
  var rows={};
  var sleepText=h("p",{class:"small",style:"text-align:center"},"");
  var timerBig=h("div",{class:"timerbig","aria-label":"Time left on sleep timer"},"--:--");
  function sync(){
    LAYERS.forEach(function(l){
      var r=rows[l.id];if(!r)return;
      r.sw.setAttribute("aria-checked",layerOn(l.id)?"true":"false");
      r.range.value=String(Math.round((AE.vol[l.id]!=null?AE.vol[l.id]:l.def)*100));
    });
    tick();
  }
  function tick(){
    var left=AE.sleepAt-Date.now();
    if(AE.sleepAt&&left>0){
      var m=Math.floor(left/60000),sc=Math.floor(left/1000)%60;
      timerBig.textContent=m+":"+(sc<10?"0":"")+sc;sleepText.textContent="Sound will fade out when this reaches zero.";
    }else{timerBig.textContent="--:--";sleepText.textContent="No sleep timer set.";}
  }
  var chips=h("div",{class:"chips"});
  SOUND_PRESETS.forEach(function(p){
    chips.append(h("button",{class:"chip",type:"button",onclick:function(){
      stopAll();
      setTimeout(function(){Object.keys(p.l).forEach(function(id){startLayer(id,p.l[id]);});sync();},60);
      markAct();save();say(p.name);
    }},p.name));
  });
  var mix=h("div",{class:"card"});
  mix.append(h("div",{class:"label"},"Start with a mix"),chips);
  w.append(mix);
  var lay=h("div",{class:"card"});
  lay.append(h("div",{class:"label"},"Or build your own"));
  LAYERS.forEach(function(l){
    var sw=h("button",{class:"switch",type:"button",role:"switch","aria-checked":"false","aria-label":l.name});
    var range=h("input",{type:"range",min:"0",max:"100",value:String(Math.round(l.def*100)),"aria-label":l.name+" volume"});
    sw.addEventListener("click",function(){
      if(layerOn(l.id))stopLayer(l.id);else{startLayer(l.id);markAct();save();}
      sync();
    });
    range.addEventListener("input",function(){setVol(l.id,Number(range.value)/100);});
    rows[l.id]={sw:sw,range:range};
    lay.append(h("div",{class:"layer"},h("div",null,h("div",{class:"nm"},l.name),h("div",{class:"small"},l.desc)),sw,range));
  });
  w.append(lay);
  var timers=h("div",{class:"chips"});
  [[15,"15 min"],[30,"30 min"],[60,"1 hour"],[0,"Off"]].forEach(function(t){
    timers.append(h("button",{class:"chip",type:"button",onclick:function(){setSleep(t[0]);sync();say(t[0]?"Sleep timer set":"Sleep timer off");}},t[1]));
  });
  w.append(h("div",{class:"card"},h("div",{class:"label"},"Sleep timer"),timerBig,sleepText,timers,
    h("div",{class:"row"},h("button",{class:"btn quiet",type:"button",onclick:function(){stopAll();sync();}},"Stop all sound"))));
  sync();
  var ti=setInterval(tick,1000);
  cleanup=function(){clearInterval(ti);};
  return w;
}

/* ---- voice settings, used in Scenes, Guided and Settings ---- */
function voiceCard(){
  var card=h("div",{class:"card"});
  card.append(h("div",{class:"label"},"Voice"));
  if(!VOICE_OK){
    card.append(h("p",{class:"small"},"This browser cannot play spoken words. You can still read the words on the screen."));
    return card;
  }
  var SAMPLE="Hello. Let your shoulders drop, and breathe out slowly.";
  card.append(toggleRow("Read the words aloud","A calm voice, so you can close your eyes.",S.voice,function(v){S.voice=v;save();if(v){ac();speak(SAMPLE);}else stopSpeech();}));
  var engines=h("div",{class:"chips",role:"radiogroup","aria-label":"Which voice"});
  var phoneBox=h("div",{style:"display:flex;flex-direction:column;gap:10px"});
  var ENG=[["heart","Heart","Warm and gentle"],["nicole","Nicole","Soft and breathy"],["emma","Emma","British, calm"],["phone","My phone","Your phone's own voice"]];
  function paintEng(){
    engines.replaceChildren();
    ENG.forEach(function(o){
      var on=S.voiceEngine===o[0];
      var b=h("button",{class:"chip"+(on?" on":""),type:"button",role:"radio","aria-checked":on?"true":"false","aria-label":o[1]+". "+o[2]},o[1]);
      b.addEventListener("click",function(){S.voiceEngine=o[0];save();paintEng();ac();stopSpeech();speak(SAMPLE);});
      engines.append(b);
    });
    phoneBox.hidden=S.voiceEngine!=="phone";
    desc.textContent=(ENG.filter(function(o){return o[0]===S.voiceEngine;})[0]||ENG[0])[2]+". Tap a name to hear it.";
  }
  var desc=h("p",{class:"small"},"");
  card.append(h("div",{class:"small"},"Which voice"),engines,desc);
  /* phone voice options only matter for the phone's own voice */
  if(TTS.ok){
    var speeds=h("div",{class:"chips",role:"radiogroup","aria-label":"Speaking speed"});
    [[0.7,"Slowest"],[0.85,"Gentle"],[1,"Normal"]].forEach(function(o){
      var on=Math.abs(S.voiceRate-o[0])<.02;
      var b=h("button",{class:"chip"+(on?" on":""),type:"button",role:"radio","aria-checked":on?"true":"false"},o[1]);
      b.addEventListener("click",function(){
        S.voiceRate=o[0];save();
        speeds.querySelectorAll(".chip").forEach(function(c){c.classList.remove("on");c.setAttribute("aria-checked","false");});
        b.classList.add("on");b.setAttribute("aria-checked","true");
        stopSpeech();speak("Let your shoulders drop.");
      });
      speeds.append(b);
    });
    var sel=h("select",{"aria-label":"Phone voice"});
    var fill=function(){
      sel.replaceChildren(h("option",{value:""},"My phone's own voice (default)"));
      TTS.voices.slice().sort(function(a,b){var ea=/^en/i.test(a.lang)?1:0,eb=/^en/i.test(b.lang)?1:0;return eb-ea||a.name.localeCompare(b.name);}).forEach(function(v){
        var o=h("option",{value:v.name},v.name+" ("+v.lang+")");
        if(v.name===S.voiceName)o.selected=true;
        sel.append(o);
      });
    };
    fill();
    setTimeout(function(){loadVoices();if(sel.isConnected)fill();},600);
    sel.addEventListener("change",function(){S.voiceName=sel.value;save();stopSpeech();speak("Hello. I will read to you in this voice.");});
    phoneBox.append(h("div",{class:"small"},"Speed"),speeds,h("div",{class:"small"},"Which phone voice"),sel);
  }
  card.append(phoneBox);
  paintEng();
  card.append(h("div",{class:"row"},h("button",{class:"btn ghost",type:"button",onclick:function(){ac();stopSpeech();speak(SAMPLE);}},"Hear a sample")));
  return card;
}

/* ---- scenes ---- */
function viewScenes(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Scenes","Full-screen moving light with slow words. Turn on the voice, tap Eyes closed, and just listen."));
  function sceneBtn(cls,title,kind,sounds,stars){
    var b=h("button",{class:"scene-btn "+cls,type:"button",onclick:function(){
      sfx("tick");
      if(S.sceneSound&&!anyPlaying())sounds.forEach(function(id){startLayer(id);});
      openScene(kind,sounds);markAct();save();
    }},h("span",null,title));
    stars.forEach(function(s){b.append(h("i",{style:"left:"+s[0]+"%;top:"+s[1]+"%;width:"+s[2]+"px;height:"+s[2]+"px;animation-delay:"+s[3]+"s"}));});
    return b;
  }
  w.append(h("div",{class:"card"},
    h("div",{class:"scene-grid"},
      sceneBtn("sc1","Night sea","night",["ocean","chimes"],[[20,18,3,0],[60,12,2,1],[80,30,3,2],[40,34,2,.5]]),
      sceneBtn("sc2","Aurora","aurora",["pad","bowl"],[[15,15,2,.3],[50,10,3,1.4],[78,22,2,2.2],[30,38,2,.8]]),
      sceneBtn("sc3","Fireflies","fireflies",["night","pad"],[[25,30,4,0],[62,22,4,1.2],[48,50,3,2],[78,44,4,.6]])),
    toggleRow("Play a matching sound","Starts a soft background with the scene.",S.sceneSound,function(v){S.sceneSound=v;save();})));
  w.append(voiceCard());
  return w;
}

/* ---- breathe ---- */
function easeIO(p){return 0.5-0.5*Math.cos(Math.PI*clampN(p,0,1));}
function viewBreathe(){
  var w=h("section",{class:"view"});
  var pattern="calm",mins=2;
  w.append(pageHead("Breathe","A slow guide. Follow the circle: it grows as you breathe in, and shrinks as you breathe out."));
  var setup=h("div",{style:"display:flex;flex-direction:column;gap:16px"});
  var run=h("div",{hidden:true,style:"display:flex;flex-direction:column;gap:14px"});
  w.append(setup,run);

  /* setup */
  var pchips=h("div",{class:"chips",role:"radiogroup","aria-label":"Breathing pattern"});
  Object.keys(BREATH_PATTERNS).forEach(function(k){
    var b=h("button",{class:"chip"+(k===pattern?" on":""),type:"button",role:"radio","aria-checked":k===pattern?"true":"false"},BREATH_PATTERNS[k].name);
    b.addEventListener("click",function(){
      pattern=k;pchips.querySelectorAll(".chip").forEach(function(c){c.classList.remove("on");c.setAttribute("aria-checked","false");});
      b.classList.add("on");b.setAttribute("aria-checked","true");pdesc.textContent=BREATH_PATTERNS[k].desc;
    });
    pchips.append(b);
  });
  var pdesc=h("p",{class:"small"},BREATH_PATTERNS[pattern].desc);
  var lchips=h("div",{class:"chips",role:"radiogroup","aria-label":"How long"});
  [[1,"1 min"],[2,"2 min"],[5,"5 min"],[0,"No end"]].forEach(function(o){
    var b=h("button",{class:"chip"+(o[0]===mins?" on":""),type:"button",role:"radio","aria-checked":o[0]===mins?"true":"false"},o[1]);
    b.addEventListener("click",function(){
      mins=o[0];lchips.querySelectorAll(".chip").forEach(function(c){c.classList.remove("on");c.setAttribute("aria-checked","false");});
      b.classList.add("on");b.setAttribute("aria-checked","true");
    });
    lchips.append(b);
  });
  var startBtn=h("button",{class:"btn",type:"button",style:"width:100%"},"Start");
  setup.append(h("div",{class:"card"},
    h("div",{class:"label"},"Rhythm"),pchips,pdesc,
    h("div",{class:"label"},"How long"),lchips,
    toggleRow("Breathing sounds","A rising tone as you breathe in, a different, falling tone as you breathe out.",S.breathSound,function(v){S.breathSound=v;save();}),
    toggleRow("Spoken cues","A voice says breathe in, hold, breathe out.",S.breathVoice,function(v){S.breathVoice=v;save();if(v&&VOICE_OK){ac();speak("Breathe in");}}),
    startBtn));

  /* run view */
  var R=2*Math.PI*46;
  var ringSvg='<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bring-bg" cx="50" cy="50" r="46"/><circle class="bring" cx="50" cy="50" r="46" stroke-dasharray="'+R.toFixed(2)+'" stroke-dashoffset="'+R.toFixed(2)+'"/></svg>';
  var circle=h("div",{class:"bcircle"});
  var lbl=h("div",{class:"bl"},"Get ready");
  var num=h("div",{class:"bn"},"");
  var wrap=h("div",{class:"bwrap"},h("span",{html:ringSvg,style:"display:contents"}),circle,h("div",{class:"bcenter"},lbl,num));
  var meta=h("p",{class:"bmeta","aria-live":"off"},"");
  var pauseBtn=h("button",{class:"btn quiet",type:"button"},"Pause");
  var stopBtn=h("button",{class:"btn ghost",type:"button"},"Stop");
  var live=h("div",{class:"card"},
    toggleRow("Sounds","",S.breathSound,function(v){S.breathSound=v;save();if(!v&&st&&st.snd){st.snd.stop();st.snd=null;}}),
    toggleRow("Spoken cues","",S.breathVoice,function(v){S.breathVoice=v;save();if(!v)stopSpeech();}));
  run.append(wrap,meta,h("div",{class:"row",style:"justify-content:center"},pauseBtn,stopBtn),live);
  var ring=wrap.querySelector(".bring");

  var st=null;
  var reducedMo=reduced();
  var LABEL={in:"Breathe in",out:"Breathe out",hold:"Hold"};
  function enterPhase(i,fromScale){
    var ph=BREATH_PATTERNS[pattern].ph,p=ph[i%ph.length];
    st.i=i%ph.length;st.el=0;st.secs=p[1];st.kind=p[0];st.from=fromScale;
    st.to=p[0]==="in"?1:(p[0]==="out"?.55:fromScale);
    lbl.textContent=LABEL[p[0]];
    if(st.snd){st.snd.stop();st.snd=null;}
    stopSpeech();
    if(p[0]!=="hold"&&S.breathSound)st.snd=breathSound(p[0],p[1]);
    if(S.breathVoice)speak(LABEL[p[0]]);
  }
  function frame(now){
    if(!st||st.dead)return;
    st.raf=requestAnimationFrame(frame);
    var dt=Math.min(.1,(now-st.last)/1000);st.last=now;
    if(st.paused)return;
    st.el+=dt;st.total+=dt;
    var ph=BREATH_PATTERNS[pattern].ph;
    if(st.el>=st.secs){
      var cur=st.to;
      if(st.i+1>=ph.length){
        st.cycles++;
        if(st.limit&&st.total>=st.limit){finish();return;}
      }
      enterPhase(st.i+1,cur);
    }
    var p=clampN(st.el/st.secs,0,1);
    var s=reducedMo?(p>=.5||st.kind==="hold"?st.to:st.from):st.from+(st.to-st.from)*easeIO(p);
    circle.style.transform="scale("+s.toFixed(4)+")";
    ring.setAttribute("stroke-dashoffset",(R*(1-p)).toFixed(2));
    num.textContent=String(Math.max(1,Math.ceil(st.secs-st.el)));
    meta.textContent="Breath "+(st.cycles+1)+(st.limit?" · "+Math.max(0,Math.ceil((st.limit-st.total)/60*10)/10).toFixed(1).replace(/\.0$/,"")+" min left":"");
  }
  function stopRun(){
    if(st){st.dead=true;cancelAnimationFrame(st.raf);if(st.snd)st.snd.stop();}
    stopSpeech();st=null;
  }
  function finish(){
    var total=st?st.total:0;
    stopRun();
    sfx("bowl");markAct();save();
    run.hidden=true;setup.hidden=false;
    setup.prepend(h("div",{class:"card lamp",id:"breathDone"},h("h2",null,"Well done"),h("p",null,"You gave yourself "+Math.max(1,Math.round(total/60))+" quiet "+(Math.round(total/60)<=1?"minute":"minutes")+". Notice how your body feels now.")));
  }
  startBtn.addEventListener("click",function(){
    var old=setup.querySelector("#breathDone");if(old)old.remove();
    ac();prewarm(["Breathe in","Breathe out","Hold"]);
    setup.hidden=true;run.hidden=false;
    st={i:0,el:0,secs:1,kind:"in",from:.55,to:1,total:0,cycles:0,paused:false,dead:false,snd:null,raf:0,last:performance.now(),limit:mins?mins*60:0};
    circle.style.transform="scale(.55)";
    lbl.textContent="Get comfortable";num.textContent="";
    pauseBtn.textContent="Pause";
    /* a short settling moment, then the first breath */
    st.paused=true;
    var pre=setTimeout(function(){if(!st||st.dead)return;st.paused=false;st.last=performance.now();enterPhase(0,.55);},1800);
    st.pre=pre;
    st.raf=requestAnimationFrame(frame);
  });
  pauseBtn.addEventListener("click",function(){
    if(!st)return;
    if(!st.paused){
      st.paused=true;if(st.snd){st.snd.stop();st.snd=null;}stopSpeech();
      lbl.textContent="Paused";pauseBtn.textContent="Continue";
    }else{
      st.paused=false;st.last=performance.now();pauseBtn.textContent="Pause";
      var cur=reducedMo?st.to:(st.from+(st.to-st.from)*easeIO(st.el/st.secs));
      enterPhase(st.i,cur);
    }
  });
  stopBtn.addEventListener("click",function(){
    if(st)clearTimeout(st.pre);
    stopRun();run.hidden=true;setup.hidden=false;
  });
  var onVis=function(){if(document.hidden&&st&&!st.paused){pauseBtn.click();}};
  document.addEventListener("visibilitychange",onVis);
  cleanup=function(){document.removeEventListener("visibilitychange",onVis);if(st)clearTimeout(st.pre);stopRun();};
  return w;
}

/* ---- guided ---- */
function viewGuided(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Guided","Short sessions that take you through it, one gentle step at a time."));
  var timers=[];
  var box=h("div",{class:"card sky"});
  var gbox=h("div",{class:"card"});
  function clearAll(){timers.forEach(function(t){clearTimeout(t);clearInterval(t);});timers=[];stopSpeech();}
  /* two-minute reset */
  function resetIdle(){
    clearAll();
    box.replaceChildren(
      h("div",{class:"label",style:"color:inherit;opacity:.8"},"Two-minute reset"),
      h("p",null,"Eight gentle prompts. "+(S.voice&&VOICE_OK?"A voice will read each one.":"Turn on the voice below if you would like to close your eyes.")),
      h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:startReset},"Begin")));
  }
  function startReset(){
    clearAll();
    var i=0,total=RESET.length,voiceOn=!!(S.voice&&VOICE_OK);
    sfx("bowl");
    var head=h("div",{class:"label",style:"color:inherit;opacity:.8"},"Prompt 1 of "+total);
    var p=h("p",{class:"progress-prompt"},RESET[0]);
    var bar=h("div",{class:"bar-inner",style:"width:"+(100/total)+"%"});
    var stopBtn=h("button",{class:"btn quiet",type:"button",style:"color:inherit;border-color:currentColor"},"Stop");
    box.replaceChildren(head,p,h("div",{class:"bar-outer"},bar),h("div",{class:"row"},stopBtn));
    stopBtn.addEventListener("click",resetIdle);
    function show(){
      head.textContent="Prompt "+(i+1)+" of "+total;p.textContent=RESET[i];bar.style.width=((i+1)/total*100)+"%";
      if(voiceOn){speak(RESET[i],function(){timers.push(setTimeout(next,9000));});}
      else timers.push(setTimeout(next,15000));
    }
    function next(){
      i++;
      if(i>=total){
        sfx("bowl");sfx("sparkle");confetti(50);markAct();save();
        box.replaceChildren(h("h2",null,"Well done"),h("p",null,"You gave yourself two quiet minutes."),h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:resetIdle},"Again")));
        if(voiceOn)speak("Well done. You gave yourself two quiet minutes.");
        return;
      }
      show();
    }
    if(voiceOn&&S.voiceEngine==="phone"&&TTS.ok){try{var u=new SpeechSynthesisUtterance(" ");u.volume=0;window.speechSynthesis.speak(u);}catch(e){}}
    show();
  }
  /* grounding 5-4-3-2-1 */
  function groundIdle(){
    clearAll();
    gbox.replaceChildren(
      h("div",{class:"label"},"Ground yourself"),
      h("p",null,"Five slow steps through your senses. Tap a dot for each thing you notice."),
      h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){groundStep(0);}},"Begin")));
  }
  function groundStep(n){
    clearAll();
    if(n>=GROUND.length){
      sfx("sparkle");confetti(40);markAct();save();
      gbox.replaceChildren(h("h2",null,"You are here"),h("p",null,"Feet on the ground, breath in your body. Well done."),h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:groundIdle},"Again")));
      if(S.voice&&VOICE_OK)speak("You are here. Well done.");
      return;
    }
    var g=GROUND[n],lit=0;
    var dotsRow=h("div",{class:"row",style:"justify-content:center;gap:14px"});
    var nextBtn=h("button",{class:"btn",type:"button",disabled:true},n===GROUND.length-1?"Finish":"Next");
    var ds=[],i;
    for(i=0;i<g.n;i++){
      (function(){
        var d=h("button",{class:"chip",type:"button","aria-label":"Noticed one","aria-pressed":"false",style:"min-width:52px;min-height:52px;border-radius:50%;padding:0"},"");
        d.addEventListener("click",function(){
          if(d.getAttribute("aria-pressed")==="true")return;
          d.setAttribute("aria-pressed","true");d.classList.add("on");d.style.background="var(--accent)";lit++;
          tone(PENTA[Math.min(lit-1,PENTA.length-1)],0.8,"sine",0.07);
          if(lit>=g.n){nextBtn.disabled=false;}
        });
        ds.push(d);dotsRow.append(d);
      })();
    }
    nextBtn.addEventListener("click",function(){groundStep(n+1);});
    gbox.replaceChildren(h("div",{class:"label"},"Step "+(n+1)+" of "+GROUND.length),h("p",{class:"step-text"},g.t),dotsRow,
      h("div",{class:"row",style:"justify-content:center"},nextBtn,h("button",{class:"btn quiet",type:"button",onclick:groundIdle},"Stop")));
    if(S.voice&&VOICE_OK)speak(g.t);
  }
  resetIdle();groundIdle();
  w.append(box,gbox);
  /* kind words */
  var kw=h("div",{class:"card lamp"});
  var kwText=h("p",{class:"step-text",style:"font-size:23px"},"Tap for something kind.");
  var kwBtn=h("button",{class:"btn",type:"button"},"Kind words");
  var lastK=null;
  kwBtn.addEventListener("click",function(){
    lastK=pick(KIND,lastK);kwText.textContent=lastK;sfx("sparkle");markAct();save();
    if(S.voice&&VOICE_OK){stopSpeech();speak(lastK);}
  });
  kw.append(h("div",{class:"label",style:"color:inherit;opacity:.8"},"Kind words"),kwText,h("div",{class:"row"},kwBtn));
  w.append(kw,voiceCard());
  cleanup=function(){clearAll();};
  return w;
}
