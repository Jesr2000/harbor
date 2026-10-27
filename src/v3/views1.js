
/* ================= shared pieces ================= */
var SHEET=null;
function closeSheet(){
  if(!SHEET)return;
  var s=SHEET;SHEET=null;
  s.bg.remove();document.removeEventListener("keydown",s.k);
  if(s.onClose)s.onClose();
}
function openSheet(nodes,onClose){
  closeSheet();
  var sheet=h("div",{class:"sheet",role:"dialog","aria-modal":"true"},nodes);
  var bg=h("div",{class:"sheet-bg"},sheet);
  bg.addEventListener("click",function(e){if(e.target===bg)closeSheet();});
  var k=function(e){if(e.key==="Escape")closeSheet();};
  document.addEventListener("keydown",k);
  document.body.append(bg);
  SHEET={bg:bg,k:k,onClose:onClose};
  return sheet;
}
function rowButton(r){
  return h("button",{class:"rowbtn",type:"button",onclick:function(){sfx("tick");go(r.to);}},
    h("span",{class:"ri"},ico(r.icon)),
    h("span",{class:"rt"},h("strong",null,r.title),h("span",{class:"rs"},r.sub)),
    h("span",{html:icoStr("chev","chev"),style:"display:contents"}));
}
function hubView(title,lede,rows){
  var w=h("section",{class:"view"});
  var pip=pipWidget("mini");
  w.append(h("div",{class:"hubhead"},h("div",null,h("h1",{class:"display"},title),h("p",{class:"lede"},lede)),pip));
  var list=h("div",{class:"rows"});
  rows.forEach(function(r){list.append(rowButton(r));});
  w.append(list);
  return w;
}
function pageHead(title,lede){
  return h("div",{class:"pagehead"},h("h1",{class:"display"},title),lede?h("p",{class:"lede",style:"margin-top:4px"},lede):null);
}
function toggleRow(label,desc,on,fn){
  var sw=h("button",{class:"switch",type:"button",role:"switch","aria-checked":on?"true":"false","aria-label":label});
  sw.addEventListener("click",function(){var v=sw.getAttribute("aria-checked")!=="true";sw.setAttribute("aria-checked",v?"true":"false");fn(v);});
  return h("div",{class:"toggle-row"},h("div",null,h("div",{style:"font-weight:700"},label),desc?h("div",{class:"small"},desc):null),sw);
}
function giftItem(){
  var missing=HATIDS.filter(function(x){return S.hats.indexOf(x)<0;});
  if(missing.length&&Math.random()<.3){
    var hid=pick(missing);
    S.hats.push(hid);save();
    return {kind:"New hat for Pip",text:"Pip found a "+HATS[HATIDS.indexOf(hid)][1].toLowerCase()+". Find it in Play, then Pip's wardrobe.",hat:hid};
  }
  var t=Math.floor(Math.random()*5);
  if(t===0)return {kind:"Joke",text:pick(JOKES)};
  if(t===1)return {kind:"Kind note",text:pick(KIND)};
  if(t===2)return {kind:"Fun fact",text:pick(FACTS)};
  if(t===3)return {kind:"Silly dare",text:pick(DARES)};
  var p=pick(PLACES);return {kind:"Place to dream about",text:p.name+". "+p.fact};
}
function openGiftSheet(onDone){
  var today=dayKey(Date.now());
  var box=h("div",{style:"display:flex;flex-direction:column;gap:14px"});
  function paint(){
    box.replaceChildren();
    if(S.gift.day===today&&S.gift.item){
      box.append(h("div",{class:"label"},"Today's gift · "+S.gift.item.kind),
        h("p",{class:"step-text",style:"font-size:23px"},S.gift.item.text),
        h("p",{class:"small"},"A new gift arrives tomorrow. No need to come back for it."),
        h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:closeSheet},"Thanks, Pip")));
    }else{
      var svg=h("div",{html:chestSvg()});svg.firstChild.classList.add("ready");
      box.append(svg,h("h2",{style:"text-align:center"},"A gift from Pip"),
        h("p",{class:"small",style:"text-align:center"},"One a day. It is free, and there is nothing you need to do to earn it."),
        h("div",{class:"row",style:"justify-content:center"},h("button",{class:"btn popbtn",type:"button",onclick:function(){
          svg.firstChild.classList.remove("ready");svg.firstChild.classList.add("open");sfx("sparkle");
          S.gift={day:today,item:giftItem()};markAct();save();
          setTimeout(function(){confetti(80);paint();if(onDone)onDone();},650);
        }},"Open it")));
    }
  }
  paint();
  openSheet(box);
}

/* ================= home ================= */
var HUB_OF=["feel","calm","play","grow"];
function viewHome(){
  var w=h("section",{class:"home"});
  if(!storageOk){
    w.append(h("div",{class:"banner"},"This browser is not keeping data between visits. Use Settings, then Backup, to copy what you write."));
  }
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  var line=h("p",{class:"pipline","aria-live":"polite"},"");
  function say2(t){line.textContent=t;line.style.animation="none";void line.offsetWidth;line.style.animation="";}

  var stage=h("div",{class:"stage"});
  var quads=h("div",{class:"quads"});
  var QUADS=[
    {id:"feel",label:"Feel",sub:"Check in",d:"0s"},
    {id:"calm",label:"Calm",sub:"Breathe, rest",d:"-1.4s"},
    {id:"play",label:"Play",sub:"Games, giggles",d:"-2.8s"},
    {id:"grow",label:"Grow",sub:"Tiny steps",d:"-4.2s"}
  ];
  var qEls=[];
  var todayDone=S.entries.some(function(e){return dayKey(e.t)===dayKey(Date.now());});
  QUADS.forEach(function(q){
    var b=h("button",{class:"quad q-"+q.id,type:"button","aria-label":q.label+". "+q.sub,style:"--d:"+q.d},
      h("span",{html:quadArt(q.id),style:"display:contents"}),
      h("span",{style:"display:block"},h("strong",null,q.label),h("span",{class:"qs",style:"display:block"},q.sub)));
    if(q.id==="feel"&&!todayDone)b.append(h("span",{class:"qdot","aria-hidden":"true"}));
    b.addEventListener("click",function(){sfx("tick");go(q.id);});
    qEls.push(b);quads.append(b);
  });
  var NS="http://www.w3.org/2000/svg";
  var sling=document.createElementNS(NS,"svg");
  sling.setAttribute("class","sling");sling.setAttribute("aria-hidden","true");
  var fork=document.createElementNS(NS,"path");fork.setAttribute("class","fork");
  var band=document.createElementNS(NS,"path");band.setAttribute("class","band");
  var dots=document.createElementNS(NS,"g");dots.setAttribute("class","dots");
  var di;for(di=0;di<5;di++){var c=document.createElementNS(NS,"circle");dots.appendChild(c);}
  sling.append(fork,band,dots);

  var pip=pipWidget("home",say2);
  pip.setAttribute("aria-label","Pip. Tap me for a surprise. Hold and pull me back, then let go, to fling me to a square.");
  var anchor=h("div",{class:"anchor"},pip);
  stage.append(quads,sling,anchor);

  var giftBtn=h("button",{class:"giftpill",type:"button",onclick:function(){openGiftSheet(function(){refreshGift();});}});
  function refreshGift(){
    var opened=S.gift.day===dayKey(Date.now())&&S.gift.item;
    var kids=[h("span",{html:chestSvg(),style:"display:contents"}),document.createTextNode(opened?"Today's gift":"A gift from Pip")];
    if(!opened)kids.push(h("span",{class:"gd","aria-hidden":"true"}));
    giftBtn.replaceChildren.apply(giftBtn,kids);
    giftBtn.firstChild.firstChild.classList.remove("chest");
  }
  refreshGift();
  var hint=h("p",{class:"hint"},S.flung?"Tap a square, or fling Pip at one.":"Tap a square. Or hold Pip, pull back, and let go.");
  w.append(stage,line,giftBtn,hint);

  /* ----- the slingshot ----- */
  var st={mode:"idle",sx:0,sy:0,dx:0,dy:0,id:null,aim:-1,timer:0,lastTick:0,W:0,H:0};
  var asleep=false,hintN=0,lastAct=Date.now();
  function wake(){
    lastAct=Date.now();
    if(asleep){asleep=false;pip.classList.remove("asleep");say2("Mm? Oh, hello. I was resting my eyes.");}
  }
  function setAim(i){
    if(i===st.aim)return;
    qEls.forEach(function(q,k){q.classList.toggle("aim",k===i);});
    st.aim=i;
  }
  function drawSling(){
    var cx=st.W/2,cy=st.H/2,px=cx+st.dx,py=cy+st.dy+4;
    fork.setAttribute("d","M"+(cx-36)+" "+(cy+2)+" L"+(cx-36)+" "+(cy+30)+" Q"+(cx-36)+" "+(cy+46)+" "+cx+" "+(cy+50)+" Q"+(cx+36)+" "+(cy+46)+" "+(cx+36)+" "+(cy+30)+" L"+(cx+36)+" "+(cy+2)+" M"+cx+" "+(cy+50)+" L"+cx+" "+(cy+84));
    band.setAttribute("d","M"+(cx-36)+" "+(cy+2)+" L"+px+" "+py+" L"+(cx+36)+" "+(cy+2));
    var len=Math.hypot(st.dx,st.dy),i,ds=dots.childNodes;
    for(i=0;i<ds.length;i++){
      if(len<26){ds[i].setAttribute("r","0");continue;}
      var dist=70+i*34,ux=-st.dx/len,uy=-st.dy/len;
      ds[i].setAttribute("cx",(cx+ux*dist).toFixed(1));ds[i].setAttribute("cy",(cy+uy*dist).toFixed(1));
      ds[i].setAttribute("r",(6-i*.9).toFixed(1));ds[i].setAttribute("opacity",(0.9-i*.15).toFixed(2));
    }
  }
  function beginLoad(){
    if(st.mode!=="down")return;
    clearTimeout(st.timer);
    var r=stage.getBoundingClientRect();st.W=r.width;st.H=r.height;st.dx=0;st.dy=0;
    sling.setAttribute("viewBox","0 0 "+st.W+" "+st.H);
    st.mode="load";pip.classList.add("loading");sling.classList.add("on");
    drawSling();sfx("tick");
    try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
    say2("Pull me back, then let go!");
  }
  function moveTo(dx,dy){
    var rmax=st.W*.3,len=Math.hypot(dx,dy);
    if(len>rmax){dx*=rmax/len;dy*=rmax/len;len=rmax;}
    st.dx=dx;st.dy=dy;
    pip.style.transform="translate("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px)";
    if(len>=26){
      var lx=-dx,ly=-dy;
      setAim((ly>=0?2:0)+(lx>=0?1:0));
      if(Math.abs(len-st.lastTick)>22){st.lastTick=len;tone(260+len*3.2,0.05,"triangle",0.035);}
    }else setAim(-1);
    drawSling();
  }
  function endGesture(){
    st.mode="idle";st.id=null;sling.classList.remove("on");pip.classList.remove("loading");setAim(-1);
  }
  function springBack(){
    var cur=pip.style.transform||"translate(0px,0px)";
    sling.classList.remove("on");
    endGesture();
    if(pip.animate&&!reduced()){
      var a=pip.animate([{transform:cur},{transform:"translate(0px,0px)"}],{duration:320,easing:"cubic-bezier(.3,1.7,.5,1)"});
      a.onfinish=function(){pip.style.transform="";};
      setTimeout(function(){pip.style.transform="";},450);
    }else pip.style.transform="";
    sfx("boing");
  }
  function fling(idx){
    var r=stage.getBoundingClientRect(),dx0=st.dx,dy0=st.dy;
    var tx=(idx%2?1:-1)*r.width/4,ty=(idx>1?1:-1)*r.height/4;
    st.mode="fly";pip.classList.remove("loading");pip.classList.add("fly");sling.classList.remove("on");
    sfx("twang");whoosh(.45);
    try{if(navigator.vibrate)navigator.vibrate([10,30,18]);}catch(e){}
    var done=false;
    function finish(){
      if(done)return;done=true;
      qEls[idx].classList.add("land");sfx("boing");
      if(!S.flung){S.flung=true;save();}
      later(function(){go(HUB_OF[idx]);},240);
    }
    if(reduced()||!pip.animate){finish();return;}
    var mx=(dx0*-.3+tx)/2,my=(dy0*-.3+ty)/2-44;
    var a=pip.animate([
      {transform:"translate("+dx0+"px,"+dy0+"px) scale(1.1) rotate(0deg)"},
      {transform:"translate("+mx.toFixed(1)+"px,"+my.toFixed(1)+"px) scale(1.2) rotate(200deg)",offset:.55},
      {transform:"translate("+tx.toFixed(1)+"px,"+ty.toFixed(1)+"px) scale(.6) rotate(360deg)"}
    ],{duration:560,easing:"cubic-bezier(.25,.7,.4,1)",fill:"forwards"});
    a.onfinish=finish;later(finish,900);
  }
  pip.addEventListener("pointerdown",function(e){
    if(st.mode!=="idle")return;
    if(e.button!=null&&e.button>0)return;
    wake();
    st.mode="down";st.sx=e.clientX;st.sy=e.clientY;st.id=e.pointerId;st.lastTick=0;
    try{pip.setPointerCapture(e.pointerId);}catch(err){}
    st.timer=setTimeout(beginLoad,190);
    e.preventDefault();
  });
  pip.addEventListener("pointermove",function(e){
    if(e.pointerId!==st.id)return;
    var dx=e.clientX-st.sx,dy=e.clientY-st.sy;
    if(st.mode==="down"&&Math.hypot(dx,dy)>7)beginLoad();
    if(st.mode==="load")moveTo(dx,dy);
  });
  function up(e){
    if(e.pointerId!==st.id)return;
    clearTimeout(st.timer);
    if(st.mode==="down"){
      endGesture();pip.poke();pip.act("hop",800);
    }else if(st.mode==="load"){
      var len=Math.hypot(st.dx,st.dy);
      if(len>=26&&st.aim>=0){var idx=st.aim;setAim(-1);fling(idx);}
      else springBack();
    }
  }
  pip.addEventListener("pointerup",up);
  pip.addEventListener("pointercancel",function(e){if(e.pointerId!==st.id)return;clearTimeout(st.timer);if(st.mode==="load")springBack();else endGesture();});
  pip.addEventListener("lostpointercapture",function(e){if(e.pointerId===st.id&&st.mode==="down"){clearTimeout(st.timer);endGesture();}});
  var onAny=function(){wake();};
  document.addEventListener("pointerdown",onAny,true);

  /* ----- life: greeting, idle moves, sleep ----- */
  var lvl=moodLevel();
  var open=greeting()+" "+(lvl<=2?"No pressure today. Pick a square, or just sit with me.":(lvl>=4?"The sky looks good on you today.":"I am glad you are here."));
  later(function(){say2(open);},500);
  if(!todayDone)later(function(){if(st.mode==="idle"&&!asleep)say2("Want to tell me how you are feeling? Tap Feel.");},9000);
  var iv=setInterval(function(){
    if(st.mode!=="idle")return;
    if(!asleep&&Date.now()-lastAct>45000){asleep=true;pip.classList.add("asleep");say2("Zzz...");return;}
    if(asleep)return;
    var r=Math.random();
    if(!S.flung&&hintN<3&&Date.now()-lastAct>9000){hintN++;pip.act("wiggle",900);say2("Psst. Hold me, pull back, and let go. Try it.");return;}
    if(r<.3)pip.act("hop",800);
    else if(r<.55)glanceAround();
    else if(r<.7){pip.act("wiggle",900);}
    else say2(pipLine());
  },8500);
  cleanup=function(){
    clearInterval(iv);timers.forEach(clearTimeout);clearTimeout(st.timer);
    document.removeEventListener("pointerdown",onAny,true);
    look.idle=null;
  };
  if(!S.intro){
    later(function(){
      var body=[h("h2",null,"Welcome to Harbor"),
        h("p",null,"A free, private place to check in, calm down, play and take tiny steps. It has no account and no ads. What you write stays on this phone."),
        h("p",null,"Harbor is a support tool, not a therapist. If things feel too big, the Help button is always at the top."),
        h("p",null,"Tap a square to go there. Or hold Pip, pull him back like a slingshot, and let go."),
        h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:closeSheet},"Okay, let's start"))];
      openSheet(body,function(){S.intro=true;save();});
    },700);
  }
  return w;
}

/* ================= FEEL ================= */
function viewFeel(){
  var last=null;S.entries.forEach(function(e){if(!last||e.t>last.t)last=e;});
  var lede=last?"Last check-in: "+MOODS[last.mood-1].label.toLowerCase()+", "+fmtDate(last.t)+".":"No pressure. Pick one of these.";
  return hubView("Feel",lede,[
    {icon:"checkin",title:"Check in",sub:"How are you, right now?",to:"checkin"},
    {icon:"letgo",title:"Let it go",sub:"Write it down, then send it away",to:"letgo"},
    {icon:"tide",title:"My tide",sub:"See how the days have been",to:"tide"}
  ]);
}
var stepEnergy=null,stepText=null,stepState="offer";
function resultCard(level,text){
  var kids=[];
  if(text&&CRISIS.test(text)){
    kids.push(h("div",{class:"card helpcard"},
      h("h2",null,"You deserve support from a real person"),
      h("p",null,"What you wrote sounds very painful. Please reach out to someone now. The helplines are free, and you can also go to the nearest hospital."),
      h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){go("help");}},"See helplines"))));
  }
  var acts=h("div",{class:"row"});
  if(level<=2){
    acts.append(h("button",{class:"btn",type:"button",onclick:function(){go("breathe");}},"Breathe slowly"));
    acts.append(h("button",{class:"btn ghost",type:"button",onclick:function(){stepEnergy="low";stepText=pick(STEPS.low);stepState="offer";go("step");}},"One tiny step"));
    acts.append(h("button",{class:"btn quiet",type:"button",onclick:function(){go("help");}},"Talk to someone"));
  }else if(level===3){
    acts.append(h("button",{class:"btn",type:"button",onclick:function(){stepEnergy="some";stepText=pick(STEPS.some);stepState="offer";go("step");}},"One small step"));
    acts.append(h("button",{class:"btn ghost",type:"button",onclick:function(){go("play");}},"Something silly"));
  }else{
    acts.append(h("button",{class:"btn",type:"button",onclick:function(){go("jar");}},"Save it to the jar"));
    acts.append(h("button",{class:"btn ghost",type:"button",onclick:function(){go("play");}},"Play with Pip"));
  }
  var note=null;
  if(S.palette==="mood"&&!S.palNote){S.palNote=true;save();note=h("p",{class:"small"},"The colours of Harbor follow how you feel. You can change that in Settings, under Colours.");}
  kids.push(h("div",{class:"card"},
    h("div",{class:"label"},"Saved"),
    h("p",null,(text?"Thank you for putting that into words. ":"")+REFLECT[level]),
    note,acts));
  return h("div",{style:"display:flex;flex-direction:column;gap:12px"},kids);
}
function viewCheckin(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Check in","Tap how you feel. That is all you need to do."));
  var cur=null;
  var moodRow=h("div",{class:"moods",role:"radiogroup","aria-label":"How are you feeling"});
  var composer=h("div",{class:"card",hidden:true});
  var note=h("textarea",{id:"noteInput",rows:"3",placeholder:"Anything you want to put down? Optional. It stays on this phone.","aria-label":"Optional note"});
  var saveBtn=h("button",{class:"btn ghost",type:"button"},"Save note");
  composer.append(h("div",{class:"label"},"Add a note (optional)"),note,h("div",{class:"row"},saveBtn));
  var result=h("div");
  MOODS.forEach(function(m){
    var b=h("button",{class:"mood",type:"button",role:"radio","aria-checked":"false",id:"mood"+m.n},tide(m.n),h("span",null,m.label));
    b.addEventListener("click",function(){
      if(cur&&Date.now()-cur.t<30*60000){cur.mood=m.n;}
      else{cur={id:uid(),t:Date.now(),mood:m.n,note:""};S.entries.push(cur);note.value="";}
      markAct();save();sfx("sparkle");
      moodRow.querySelectorAll(".mood").forEach(function(x){
        var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-checked",on?"true":"false");
      });
      applyPalette();
      composer.hidden=false;
      result.replaceChildren(resultCard(m.n,cur.note));
    });
    moodRow.append(b);
  });
  saveBtn.addEventListener("click",function(){
    if(!cur)return;
    cur.note=note.value.trim();save();sfx("done");say("Note saved");
    result.replaceChildren(resultCard(cur.mood,cur.note));
  });
  w.append(moodRow,result,composer);
  return w;
}

function viewLetgo(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Let it go","Write down what is weighing on you. It goes on a balloon, and the balloon floats away. Nothing is saved."));
  var ta=h("textarea",{id:"worryText",rows:"2",maxlength:"90",placeholder:"What is on your mind?","aria-label":"What is on your mind"});
  var makeBtn=h("button",{class:"btn",type:"button"},"Tie it to a balloon");
  var input=h("div",{class:"card"},ta,h("div",{class:"row"},makeBtn));
  var stageBox=h("div",{hidden:true,style:"display:flex;flex-direction:column;gap:12px"});
  var bs=h("div",{class:"balloon-stage"});
  var msg=h("p",{class:"small",style:"text-align:center"},"Pull the balloon down, then let go. Or use the button.");
  var releaseBtn=h("button",{class:"btn ghost",type:"button"},"Let it go");
  var after=h("div");
  stageBox.append(bs,msg,h("div",{class:"row",style:"justify-content:center"},releaseBtn),after);
  w.append(input,stageBox);
  var launched=false,bal=null;
  var cols=["#E8627A","#E3A64B","#5B9BE0","#8F6BD6","#3FA7A0"];
  function makeBalloon(text){
    var col=pick(cols);
    bal=h("div",{class:"balloon"});
    bal.innerHTML='<svg viewBox="0 0 150 250" aria-hidden="true"><path class="str" d="M75 150 C70 175 82 195 75 240" stroke="#888" stroke-width="2" fill="none"/><path d="M75 12 C28 12 12 56 28 92 C40 120 62 138 75 150 C88 138 110 120 122 92 C138 56 122 12 75 12Z" fill="'+col+'"/><path d="M75 150 l-7 10 h14z" fill="'+col+'"/><ellipse cx="52" cy="46" rx="10" ry="18" fill="#fff" opacity=".35" transform="rotate(25 52 46)"/></svg>';
    bal.append(h("div",{class:"tag"},text||"a worry"));
    bs.append(bal);
    var sy=0,id=null,drag=0;
    bal.addEventListener("pointerdown",function(e){
      if(launched)return;
      id=e.pointerId;sy=e.clientY;drag=0;bal.classList.add("drag");
      try{bal.setPointerCapture(id);}catch(err){}
      e.preventDefault();
    });
    bal.addEventListener("pointermove",function(e){
      if(e.pointerId!==id)return;
      drag=clampN(e.clientY-sy,0,110);
      bal.style.transform="translateY("+drag+"px) scaleY("+(1+drag/700)+")";
      if(drag>20)tone(200+drag*2,0.04,"triangle",0.025);
    });
    function rel(e){
      if(e.pointerId!==id)return;id=null;bal.classList.remove("drag");
      if(drag>30)launch(drag);
      else{bal.style.transition="transform .3s cubic-bezier(.3,1.6,.5,1)";bal.style.transform="";setTimeout(function(){bal.style.transition="";},350);}
    }
    bal.addEventListener("pointerup",rel);bal.addEventListener("pointercancel",rel);
  }
  function launch(from){
    if(launched||!bal)return;
    launched=true;releaseBtn.disabled=true;
    sfx("twang");whoosh(1.2);
    var rise=bs.clientHeight+260,dx=rnd(-40,40);
    var finish=function(){
      bal.remove();
      msg.textContent="It is gone. You do not have to carry it for a while.";
      after.replaceChildren(h("div",{class:"card"},
        h("p",null,"Letting a heavy thing leave your hands, even in make-believe, can make the next breath a little lighter."),
        h("div",{class:"row"},
          h("button",{class:"btn",type:"button",onclick:function(){go("breathe");}},"Breathe for a minute"),
          h("button",{class:"btn ghost",type:"button",onclick:function(){go("letgo");}},"Another balloon"))));
      markAct();save();sfx("sparkle");
    };
    if(reduced()||!bal.animate){finish();return;}
    var a=bal.animate([
      {transform:"translateY("+(from||0)+"px)",opacity:1},
      {transform:"translate("+(dx/2)+"px,"+(-rise*.5)+"px)",opacity:1,offset:.5},
      {transform:"translate("+dx+"px,"+(-rise)+"px)",opacity:.1}
    ],{duration:3600,easing:"cubic-bezier(.4,0,.8,.6)",fill:"forwards"});
    a.onfinish=finish;setTimeout(finish,4200);
    msg.textContent="Floating away...";
  }
  makeBtn.addEventListener("click",function(){
    var text=ta.value.trim();
    if(text&&CRISIS.test(text)){
      input.replaceChildren(h("div",{class:"helpcard",style:"padding:2px;display:flex;flex-direction:column;gap:12px;border-radius:12px"},
        h("h2",null,"You deserve support from a real person"),
        h("p",null,"What you wrote sounds very painful. Please reach out to someone now. The helplines are free."),
        h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){go("help");}},"See helplines"))));
      input.className="card helpcard";
    }else{
      input.hidden=true;
    }
    stageBox.hidden=false;makeBalloon(text);sfx("boop");
    if(!input.hidden){}
  });
  releaseBtn.addEventListener("click",function(){launch(0);});
  return w;
}

function tideChart(){
  var W=320,H=134,L=48,B=24,T=8,R=6;
  var plotH=H-T-B,bw=(W-L-R)/14;
  var now=new Date();now.setHours(0,0,0,0);
  var by={};
  S.entries.forEach(function(e){var k=dayKey(e.t);(by[k]=by[k]||[]).push(e.mood);});
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Average mood for each of the last 14 days">',lv,i;
  for(lv=1;lv<=5;lv++){var gy=H-B-(lv/5)*plotH;s+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+gy.toFixed(1)+'" y2="'+gy.toFixed(1)+'"/>';}
  s+='<text x="'+(L-6)+'" y="'+(H-B-(1/5)*plotH+3).toFixed(1)+'" text-anchor="end">Heavy</text>';
  s+='<text x="'+(L-6)+'" y="'+(H-B-plotH+3).toFixed(1)+'" text-anchor="end">Bright</text>';
  for(i=0;i<14;i++){
    var d=new Date(now);d.setDate(d.getDate()-(13-i));
    var arr=by[dayKey(d.getTime())],x=L+i*bw+bw*0.2,ww=bw*0.6;
    if(arr&&arr.length){
      var avg=arr.reduce(function(a,b){return a+b;},0)/arr.length,bh=(avg/5)*plotH;
      s+='<rect class="bar" x="'+x.toFixed(1)+'" y="'+(H-B-bh).toFixed(1)+'" width="'+ww.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="2"/>';
    }else{s+='<circle class="dot" cx="'+(x+ww/2).toFixed(1)+'" cy="'+(H-B-3)+'" r="2.5"/>';}
    s+='<text x="'+(x+ww/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+d.toLocaleDateString(undefined,{weekday:"narrow"})+'</text>';
  }
  return s+'</svg>';
}
function insight(){
  if(S.entries.length<8)return "Patterns show up after about eight check-ins. Go at your own pace.";
  var sums=[0,0,0,0,0,0,0],cnt=[0,0,0,0,0,0,0],i;
  S.entries.forEach(function(e){var wd=new Date(e.t).getDay();sums[wd]+=e.mood;cnt[wd]++;});
  var lo=-1,hi=-1,loV=9,hiV=0;
  for(i=0;i<7;i++){
    if(cnt[i]<2)continue;
    var a=sums[i]/cnt[i];
    if(a<loV){loV=a;lo=i;}
    if(a>hiV){hiV=a;hi=i;}
  }
  if(lo<0||lo===hi)return "No clear weekly pattern yet. That is normal.";
  return "So far, "+WEEKDAYS[lo]+" tend to feel the heaviest (about "+loV.toFixed(1)+" out of 5) and "+WEEKDAYS[hi]+" the lightest (about "+hiV.toFixed(1)+"). It is a pattern to plan around, not a verdict.";
}
function viewTide(){
  var w=h("section",{class:"view"});
  w.append(pageHead("My tide","The last 14 days, as the average of your check-ins."));
  w.append(h("div",{class:"card"},h("div",{html:tideChart()}),h("p",{class:"small"},insight())));
  var n=daysShownUp();
  w.append(h("div",{class:"card"},h("div",{class:"label"},"So far"),
    h("p",{class:"tally"},"You have shown up on "+n+(n===1?" day":" days")+". That total never resets. Tiny steps taken: "+S.steps.length+". Jar items: "+S.jar.length+". Flowers grown: "+S.bouquet+".")));
  var entSec=h("div",{style:"display:flex;flex-direction:column;gap:8px"});
  function paintEntries(){
    entSec.replaceChildren(h("h2",null,"Check-ins"));
    var list=S.entries.slice().sort(function(a,b){return b.t-a.t;}).slice(0,15);
    if(!list.length){entSec.append(h("p",{class:"small"},"Nothing yet. Your check-ins will appear here, newest first."));return;}
    var ul=h("ul",{class:"list"});
    list.forEach(function(e){
      ul.append(h("li",null,
        h("div",{class:"body"},
          h("div",{class:"entry-head"},tide(e.mood),h("span",null,MOODS[e.mood-1].label+" · "+fmtDate(e.t)+", "+fmtTime(e.t))),
          e.note?h("span",null,e.note):null),
        h("button",{class:"rm",type:"button","aria-label":"Delete this check-in",onclick:function(){S.entries=S.entries.filter(function(x){return x.id!==e.id;});save();applyPalette();paintEntries();}},"Delete")));
    });
    entSec.append(ul);
  }
  paintEntries();
  w.append(entSec);
  return w;
}
