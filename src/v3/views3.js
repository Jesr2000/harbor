
/* ================= PLAY ================= */
function viewPlay(){
  return hubView("Play","No score to beat. Just something to do with your hands.",[
    {icon:"bubbles",title:"Bubbles",sub:"Pop them, one by one",to:"bubbles"},
    {icon:"sheep",title:"Count sheep",sub:"A sleepy little game",to:"sheep"},
    {icon:"harp",title:"Starlight harp",sub:"Brush the strings, make music",to:"harp"},
    {icon:"hat",title:"Pip's wardrobe",sub:"Give Pip a new look",to:"wardrobe"},
    {icon:"silly",title:"Silly corner",sub:"Jokes, dares, a spinning wheel",to:"silly"}
  ]);
}

/* ---- bubbles ---- */
function viewBubbles(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Bubbles","Pop as many or as few as you like."));
  var room=h("div",{class:"room bub"});
  var count=h("p",{class:"bigcount"},"0");
  var cap=h("p",{class:"small",style:"text-align:center;min-height:2.6em"},"Tap a bubble. Every tenth one has a surprise.");
  w.append(room,count,cap);
  var popped=0,bi=null;
  function spawn(){
    if(!room.isConnected)return;
    var size=Math.round(rnd(54,96));
    var rise=room.clientHeight+size+150;
    var b=h("button",{class:"bubble",type:"button","aria-label":"Pop bubble",style:"left:"+rnd(2,80).toFixed(0)+"%;width:"+size+"px;height:"+size+"px;--dur:"+rnd(7,11).toFixed(1)+"s;--rise:"+rise+"px"});
    b.addEventListener("animationend",function(){if(!b.classList.contains("popping"))b.remove();});
    b.addEventListener("click",function(){
      if(b.classList.contains("popping"))return;
      b.classList.add("popping");
      tone(pick(PENTA)*(Math.random()<.4?.5:1),0.35,"sine",0.08);tone(1400,0.04,"triangle",0.04);
      var wd=h("span",{class:"pw",style:"left:"+(b.offsetLeft+size/4)+"px;top:"+(b.offsetTop+size/4)+"px"},pick(BUBBLE_WORDS));
      room.append(wd);setTimeout(function(){wd.remove();b.remove();},900);
      popped++;S.popped++;
      count.textContent=String(popped);
      if(popped%10===0){confetti(90);sfx("fanfare");markAct();save();cap.textContent=pick(KIND);}
    });
    room.append(b);
  }
  var k;for(k=0;k<5;k++)setTimeout(spawn,k*280);
  bi=setInterval(spawn,620);
  cleanup=function(){clearInterval(bi);save();};
  return w;
}

/* ---- count sheep ---- */
var SHEEP_SVG='<svg viewBox="0 0 90 64" aria-hidden="true"><g fill="#E9EEF5"><circle cx="30" cy="30" r="14"/><circle cx="44" cy="24" r="15"/><circle cx="58" cy="30" r="14"/><circle cx="44" cy="38" r="15"/><circle cx="26" cy="38" r="11"/><circle cx="62" cy="38" r="11"/></g><ellipse cx="72" cy="30" rx="9" ry="10" fill="#3B3B52"/><ellipse cx="68" cy="22" rx="3" ry="5" fill="#3B3B52" transform="rotate(-25 68 22)"/><circle cx="75" cy="28" r="1.6" fill="#fff"/><g stroke="#3B3B52" stroke-width="4" stroke-linecap="round"><path d="M32 48 V60 M42 50 V62 M54 50 V62 M62 48 V60"/></g></svg>';
function viewSheep(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Count sheep","Tap each sheep as it hops the fence. Take your time. Yawning is encouraged."));
  var field=h("div",{class:"field"});
  var r=rng(4),i;
  for(i=0;i<18;i++)field.append(h("i",{class:"star",style:"left:"+(r()*100).toFixed(0)+"%;top:"+(r()*42).toFixed(0)+"%;animation-delay:"+(r()*3).toFixed(1)+"s"}));
  field.append(h("div",{class:"moon"}));
  field.append(h("div",{class:"fence",html:'<svg viewBox="0 0 120 54" aria-hidden="true" style="width:100%"><g stroke="#8B6A47" stroke-width="6" stroke-linecap="round"><path d="M12 52 V8 M60 52 V8 M108 52 V8"/><path d="M4 20 H116 M4 38 H116" stroke-width="5"/></g></svg>'}));
  var count=h("p",{class:"bigcount"},"0 sheep");
  var cap=h("p",{class:"small",style:"text-align:center;min-height:2.6em"},"The first one is on its way.");
  var nightBtn=h("button",{class:"chip",type:"button","aria-pressed":"false"},"Add soft night sounds");
  w.append(field,count,cap,h("div",{class:"row",style:"justify-content:center"},nightBtn));
  var n=0,alive=true,tm=null,still=reduced();
  var msgs={5:"Five. That is a good start.",10:"Ten. Is that a yawn I hear?",20:"Twenty. Your eyes are allowed to close.",30:"Thirty. Zzz...",50:"Fifty sheep. You are a champion sleeper."};
  function counted(sheepEl){
    n++;S.sheep++;
    count.textContent=n+(n===1?" sheep":" sheep");
    if(msgs[n])cap.textContent=msgs[n];
    sfx("baa");tone(500+Math.min(n,20)*12,0.2,"sine",0.04,0.1);
    if(sheepEl){var nm=h("span",{class:"num"},String(n));sheepEl.append(nm);setTimeout(function(){nm.remove();},1300);}
    markAct();
  }
  function spawn(){
    if(!alive||!field.isConnected)return;
    var W=field.clientWidth||320;
    var s=h("div",{class:"sheep",role:"button",tabindex:"0","aria-label":"Count this sheep"});
    var inner=h("div",{class:"sj",html:SHEEP_SVG});
    s.append(inner);field.append(s);
    var done=false;
    function tap(){if(done)return;done=true;counted(s);}
    s.addEventListener("click",tap);
    s.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();tap();}});
    var dur=rnd(6500,8200);
    if(!s.animate){s.style.left=(W/2)+"px";return;}
    var a=s.animate([{transform:"translateX(-90px)"},{transform:"translateX("+(W+90)+"px)"}],{duration:dur,easing:"linear",fill:"forwards"});
    inner.animate([
      {transform:"translateY(0) rotate(0deg)"},{transform:"translateY(0) rotate(0deg)",offset:.4},
      {transform:"translateY(-62px) rotate(-10deg)",offset:.5},{transform:"translateY(0) rotate(6deg)",offset:.6},
      {transform:"translateY(0) rotate(0deg)"}
    ],{duration:dur,easing:"ease-in-out",fill:"forwards"});
    a.onfinish=function(){s.remove();};
  }
  if(still){
    cap.textContent="Motion is turned off, so tap the sheep to count it.";
    var one=h("div",{class:"sheep",style:"left:50%;margin-left:-42px",role:"button",tabindex:"0","aria-label":"Count a sheep",html:SHEEP_SVG});
    one.addEventListener("click",function(){counted(one);});
    field.append(one);
  }else{
    tm=setInterval(spawn,2600);setTimeout(spawn,500);
  }
  nightBtn.addEventListener("click",function(){
    var on=nightBtn.getAttribute("aria-pressed")==="true";
    if(on){stopLayer("night");stopLayer("pad");nightBtn.setAttribute("aria-pressed","false");nightBtn.classList.remove("on");nightBtn.textContent="Add soft night sounds";}
    else{startLayer("night",.4);startLayer("pad",.3);nightBtn.setAttribute("aria-pressed","true");nightBtn.classList.add("on");nightBtn.textContent="Soft night sounds on";}
  });
  cleanup=function(){alive=false;clearInterval(tm);save();};
  return w;
}

/* ---- starlight harp ---- */
function viewHarp(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Starlight harp","Brush your finger across the strings. Every note fits with every other one."));
  var NOTES=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];
  var hues=[200,230,260,290,320,20,50,170];
  var harp=h("div",{class:"harp",role:"group","aria-label":"Harp strings"});
  var strings=NOTES.map(function(f,i){
    var s=h("div",{class:"hstring",style:"--sc:hsl("+hues[i]+" 90% 72%)"});
    s.dataset.i=String(i);harp.append(s);return s;
  });
  function hit(i,x,y){
    var s=strings[i];
    pluck(NOTES[i],.09);
    s.classList.remove("on");void s.offsetWidth;s.classList.add("on");
    var r=harp.getBoundingClientRect();
    var sp=h("span",{class:"hspark",style:"left:"+(x-r.left)+"px;top:"+(y-r.top)+"px;--sc:hsl("+hues[i]+" 90% 72%)"});
    harp.append(sp);setTimeout(function(){sp.remove();},1150);
    if(navigator.vibrate){try{navigator.vibrate(6);}catch(e){}}
  }
  var lastIdx={};
  function stringAt(x,y){
    var el=document.elementFromPoint(x,y);
    if(el&&el.classList.contains("hstring"))return Number(el.dataset.i);
    var r=harp.getBoundingClientRect();
    if(x<r.left||x>r.right||y<r.top||y>r.bottom)return -1;
    return Math.min(NOTES.length-1,Math.max(0,Math.floor((x-r.left)/r.width*NOTES.length)));
  }
  harp.addEventListener("pointerdown",function(e){
    ac();var i=stringAt(e.clientX,e.clientY);lastIdx[e.pointerId]=i;
    try{harp.setPointerCapture(e.pointerId);}catch(err){}
    if(i>=0)hit(i,e.clientX,e.clientY);
    e.preventDefault();
  });
  harp.addEventListener("pointermove",function(e){
    if(!(e.pointerId in lastIdx))return;
    var i=stringAt(e.clientX,e.clientY);
    if(i>=0&&i!==lastIdx[e.pointerId]){lastIdx[e.pointerId]=i;hit(i,e.clientX,e.clientY);}
  });
  var endp=function(e){delete lastIdx[e.pointerId];};
  harp.addEventListener("pointerup",endp);harp.addEventListener("pointercancel",endp);
  var auto=null,autoBtn=h("button",{class:"btn ghost",type:"button"},"Let Pip play");
  autoBtn.addEventListener("click",function(){
    if(auto){auto.stop();auto=null;autoBtn.textContent="Let Pip play";return;}
    ac();autoBtn.textContent="Stop Pip";
    var pos=3;
    auto=repeat(function(){
      pos=clampN(pos+pick([-2,-1,-1,0,1,1,2]),0,NOTES.length-1);
      var r=harp.getBoundingClientRect();
      hit(pos,r.left+r.width*(pos+.5)/NOTES.length,r.top+r.height*rnd(.3,.8));
    },420,1100,100);
  });
  w.append(harp,h("div",{class:"row",style:"justify-content:center"},autoBtn));
  markAct();
  cleanup=function(){if(auto)auto.stop();};
  return w;
}

/* ---- wardrobe ---- */
function viewWardrobe(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Pip's wardrobe","Pick a look. New hats turn up in the daily gift."));
  var pip=pipWidget("big");
  w.append(h("div",{class:"bigpip"},pip));
  var row=h("div",{class:"hatrow",role:"radiogroup","aria-label":"Hats"});
  function paint(){
    row.replaceChildren();
    HATS.forEach(function(hv){
      var owned=S.hats.indexOf(hv[0])>=0;
      var b=h("button",{class:"hatbtn"+(S.hat===hv[0]?" on":""),type:"button",role:"radio","aria-checked":S.hat===hv[0]?"true":"false",disabled:!owned},owned?hv[1]:"?");
      if(!owned)b.setAttribute("aria-label","Locked hat. Found in daily gifts.");
      b.addEventListener("click",function(){
        S.hat=hv[0];save();pip.setHat(S.hat);pip.act("cheer",900);sfx("sparkle");
        pip.showLine(hv[0]==="none"?"Back to my natural look.":"Do I look fancy? I feel fancy.");
        paint();
      });
      row.append(b);
    });
  }
  paint();
  var dance=h("button",{class:"btn ghost",type:"button",onclick:function(){
    pip.act("dance",3600);sfx("sparkle");
    [523,659,784,659,880,784,1047].forEach(function(f,j){tone(f,0.3,"triangle",0.06,j*0.22);});
  }},"Make Pip dance");
  w.append(h("div",{class:"card"},row,h("p",{class:"small"},S.hats.length<HATS.length?"Locked hats show a question mark. Keep an eye on your daily gift.":"You have every hat."),h("div",{class:"row"},dance)));
  return w;
}

/* ---- silly corner ---- */
function viewSilly(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Silly corner","You do not have to earn this."));
  var out=h("div",{class:"card pop joy-out"},h("p",null,"Pick something below and it shows up here."));
  w.append(out);
  function show(kind,text,fx){
    out.replaceChildren(h("div",{class:"label",style:"color:inherit;opacity:.8"},kind),h("p",{class:"step-text",style:"font-size:22px"},text));
    out.style.animation="none";void out.offsetWidth;out.style.animation="pop .4s cubic-bezier(.2,1.4,.4,1) both";
    markAct();save();
    if(fx==="confetti")confetti(100);
    sfx(fx==="confetti"?"sparkle":"boop");
  }
  var last={};
  var extra=h("div");
  function btn(label,fn){return h("button",{class:"btn ghost",type:"button",onclick:function(){extra.replaceChildren();fn();}},label);}
  w.append(h("div",{class:"silly-grid"},
    btn("Tell me a joke",function(){last.j=pick(JOKES,last.j);show("Joke",last.j);}),
    btn("Silly dare",function(){last.d=pick(DARES,last.d);show("Silly dare",last.d);}),
    btn("Compliment cannon",function(){last.k=pick(KIND,last.k);show("Kind words",last.k,"confetti");}),
    btn("Pip's forecast",function(){last.f=pick(FORECASTS,last.f);show("Forecast",last.f);}),
    btn("Fun fact",function(){last.x=pick(FACTS,last.x);show("Did you know",last.x);}),
    btn("Spin the wheel",function(){extra.replaceChildren(wheelCard());}),
    btn("Rename a worry",function(){extra.replaceChildren(worryCard());})),extra);
  return w;
}
function wheelCard(){
  var rot=0,spinning=false;
  var R=100,cols=["#D9644A","#2F9E96","#E3A64B","#7A6BD0","#3F8FD0","#C95A8A","#4FA466","#E07B39"];
  var wsvg='<svg class="wheel" viewBox="0 0 200 200" aria-hidden="true">',i;
  for(i=0;i<8;i++){
    var a0=i*45*Math.PI/180,a1=(i+1)*45*Math.PI/180;
    var x0=100+R*Math.sin(a0),y0=100-R*Math.cos(a0),x1=100+R*Math.sin(a1),y1=100-R*Math.cos(a1);
    wsvg+='<path d="M100 100 L'+x0.toFixed(2)+' '+y0.toFixed(2)+' A'+R+' '+R+' 0 0 1 '+x1.toFixed(2)+' '+y1.toFixed(2)+'Z" fill="'+cols[i]+'" stroke="#fff" stroke-width="1.5"/>';
    wsvg+='<text x="100" y="'+(100-R*.62).toFixed(1)+'" text-anchor="middle" transform="rotate('+(i*45+22.5)+' 100 100)">'+WHEEL[i].l+'</text>';
  }
  wsvg+='<circle cx="100" cy="100" r="9" fill="#fff"/></svg>';
  var wheelEl=h("div",{html:wsvg,style:"display:contents"});
  var wres=h("p",{class:"small",style:"text-align:center;min-height:3em"},"Spin to find a tiny joy to try.");
  var spinBtn=h("button",{class:"btn popbtn",type:"button"},"Spin");
  spinBtn.addEventListener("click",function(){
    if(spinning)return;
    spinning=true;sfx("tick");
    var el=wheelEl.firstChild,extra=1440+Math.floor(Math.random()*360);
    rot+=extra;
    el.style.transform="rotate("+rot+"deg)";
    var dur=reduced()?100:4300;
    setTimeout(function(){
      var ang=((rot%360)+360)%360,idx=Math.floor(((360-ang)%360)/45);
      wres.textContent=WHEEL[idx].t;wres.style.fontWeight="700";wres.style.color="var(--ink)";
      sfx("sparkle");confetti(50);markAct();save();spinning=false;
    },dur);
  });
  return h("div",{class:"card"},h("h2",null,"Wheel of tiny joys"),h("div",{class:"wheel-wrap"},wheelEl,h("div",{class:"pointer"})),wres,h("div",{class:"row",style:"justify-content:center"},spinBtn));
}
function worryCard(){
  var win=h("input",{type:"text",id:"worryInput",placeholder:"Type a worry in a few words",maxlength:"80","aria-label":"Your worry"});
  var wout=h("p",{class:"step-text",style:"font-size:21px"},"");
  var rb=h("button",{class:"btn ghost",type:"button"},"Give it a silly name");
  rb.addEventListener("click",function(){
    var nm=pick(WORRY_T)+" "+pick(WORRY_A)+" "+pick(WORRY_N);
    wout.textContent=(win.value.trim()?"Your worry is now "+nm+". ":"Meet "+nm+". ")+"It can be loud, but it is still just "+nm+".";
    sfx("boop");markAct();save();
  });
  return h("div",{class:"card"},h("h2",null,"Rename your worry"),h("p",{class:"small"},"Naming a worry something silly can shrink it a little. Try it."),win,h("div",{class:"row"},rb),wout);
}
