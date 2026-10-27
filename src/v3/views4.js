
/* ================= GROW ================= */
function viewGrow(){
  return hubView("Grow","Small things, slowly. Nothing here resets or runs out.",[
    {icon:"step",title:"One tiny step",sub:"A single small thing to try",to:"step"},
    {icon:"garden",title:"Tiny garden",sub:"Water it once a day, watch it bloom",to:"garden"},
    {icon:"jar",title:"Evidence jar",sub:"Proof you are good, for hard days",to:"jar"},
    {icon:"someday",title:"Someday list",sub:"Places and things to look forward to",to:"someday"}
  ]);
}
function viewSteps(){
  var w=h("section",{class:"view"});
  w.append(pageHead("One tiny step","Choose the energy you have right now. There is no wrong answer and no streak to protect."));
  var chips=h("div",{class:"chips",role:"radiogroup","aria-label":"Energy level"});
  var stage=h("div");
  var opts=[["low","Very little"],["some","Some"],["good","Decent"]];
  function paintChips(){
    chips.querySelectorAll(".chip").forEach(function(c){
      var on=c.dataset.k===stepEnergy;c.classList.toggle("on",on);c.setAttribute("aria-checked",on?"true":"false");
    });
  }
  function paintStage(){
    if(!stepEnergy){stage.replaceChildren(h("p",{class:"small"},"Pick one above and a step will appear."));return;}
    if(!stepText)stepText=pick(STEPS[stepEnergy]);
    if(stepState==="done"){
      stage.replaceChildren(h("div",{class:"card lamp"},
        h("h2",null,"Logged. That counts."),
        h("p",{class:"tally"},"Steps you have taken in total: "+S.steps.length+"."),
        h("div",{class:"row"},
          h("button",{class:"btn",type:"button",onclick:function(){stepText=pick(STEPS[stepEnergy],stepText);stepState="offer";paintStage();}},"Another one"),
          h("button",{class:"btn quiet",type:"button",onclick:function(){go("grow");}},"Back"))));
      return;
    }
    if(stepState==="skip"){
      stage.replaceChildren(h("div",{class:"card"},
        h("h2",null,"That is okay"),
        h("p",null,"Resting is allowed. Come back whenever you like. Nothing is lost."),
        h("div",{class:"row"},
          h("button",{class:"btn ghost",type:"button",onclick:function(){go("breathe");}},"Breathe instead"),
          h("button",{class:"btn quiet",type:"button",onclick:function(){stepText=pick(STEPS[stepEnergy],stepText);stepState="offer";paintStage();}},"Show me one anyway"))));
      return;
    }
    stage.replaceChildren(h("div",{class:"card"},
      h("div",{class:"label"},"Your step"),
      h("p",{class:"step-text"},stepText),
      h("div",{class:"row"},
        h("button",{class:"btn",type:"button",onclick:function(){
          S.steps.push({t:Date.now(),text:stepText});markAct();save();stepState="done";
          sfx("done");confetti(70);paintStage();
        }},"Done"),
        h("button",{class:"btn ghost",type:"button",onclick:function(){stepText=pick(STEPS[stepEnergy],stepText);paintStage();}},"Another one"),
        h("button",{class:"btn quiet",type:"button",onclick:function(){stepState="skip";paintStage();}},"Not today"))));
  }
  opts.forEach(function(o){
    var b=h("button",{class:"chip",type:"button",role:"radio","aria-checked":"false","data-k":o[0]},o[1]);
    b.addEventListener("click",function(){stepEnergy=o[0];stepText=pick(STEPS[o[0]]);stepState="offer";paintChips();paintStage();});
    chips.append(b);
  });
  paintChips();paintStage();
  w.append(chips,stage);
  return w;
}
function viewJar(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Evidence jar","Keep proof for the days your mind says otherwise. Add kind words, things you finished, and moments you were proud of."));
  var input=h("input",{type:"text",id:"jarInput",placeholder:"Something true and good",maxlength:"280","aria-label":"New evidence"});
  var addBtn=h("button",{class:"btn",type:"button"},"Add to jar");
  var starters=h("div",{class:"chips"});
  JAR_STARTERS.forEach(function(s){starters.append(h("button",{class:"chip",type:"button",onclick:function(){input.value=s+": ";input.focus();}},s));});
  w.append(h("div",{class:"card"},input,h("div",{class:"row"},addBtn),
    S.jar.length===0?h("div",{class:"small"},"Need a start? Tap one:"):null,
    S.jar.length===0?starters:null));
  var openArea=h("div"),listArea=h("div");
  function paint(){
    openArea.replaceChildren();listArea.replaceChildren();
    if(S.jar.length>0){
      openArea.append(h("button",{class:"btn ghost",type:"button",style:"width:100%",onclick:function(){
        var it=S.jar[Math.floor(Math.random()*S.jar.length)];
        sfx("sparkle");
        openArea.replaceChildren(h("div",{class:"card lamp"},
          h("div",{class:"label",style:"color:inherit;opacity:.8"},"From "+fmtDate(it.t)),
          h("p",{class:"step-text"},it.text),
          h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){paint();}},"Close the jar"))));
      }},"Open the jar"));
      var ul=h("ul",{class:"list"});
      S.jar.slice().reverse().forEach(function(it){
        ul.append(h("li",null,
          h("div",{class:"body"},h("span",{class:"small"},fmtDate(it.t)),h("span",null,it.text)),
          h("button",{class:"rm",type:"button","aria-label":"Remove this item",onclick:function(){S.jar=S.jar.filter(function(x){return x.id!==it.id;});save();paint();}},"Remove")));
      });
      listArea.append(h("div",{class:"label"},S.jar.length+(S.jar.length===1?" item":" items")),ul);
    }else{
      listArea.append(h("p",{class:"small"},"The jar is empty. The first item is the hardest, and any size counts."));
    }
  }
  function add(){
    var v=input.value.trim();
    if(!v)return;
    S.jar.push({id:uid(),t:Date.now(),text:v});markAct();save();input.value="";
    sfx("sparkle");confetti(60);say("Added to your jar");
    go("jar");
  }
  addBtn.addEventListener("click",add);
  input.addEventListener("keydown",function(e){if(e.key==="Enter")add();});
  paint();
  w.append(openArea,listArea);
  return w;
}

/* ---- garden ---- */
var STAGE_NAME=["Seed","Sprout","Bud","In bloom"];
function viewGarden(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Tiny garden","Water each plant once a day. Plants here never wilt, and missing a day costs nothing."));
  var potsBox=h("div",{class:"pots"});
  var addBox=h("div");
  var today=dayKey(Date.now());
  function paint(){
    potsBox.replaceChildren();
    S.garden.forEach(function(p){
      var stg=plantStage(p.w),k=PLANT[p.kind]||KINDS[0];
      var pot=h("button",{class:"pot",type:"button","aria-label":(p.name||k.name)+", "+STAGE_NAME[stg].toLowerCase()+". "+(p.last===today?"Already watered today.":"Tap to water.")},
        h("span",{html:plantSvg(p.kind,stg),style:"display:contents"}),
        h("span",{class:"pn"},p.name||k.name),
        h("span",{class:"ps"},STAGE_NAME[stg]+(p.last===today?" · watered":"")));
      pot.addEventListener("click",function(){
        if(p.last===today){sfx("boop");say("Already watered today. Rest is part of growing.");return;}
        var before=plantStage(p.w);
        p.w++;p.last=today;markAct();save();
        var d;for(d=0;d<5;d++){pot.append(h("i",{class:"drop",style:"left:"+(32+d*9)+"%;animation-delay:"+(d*.08)+"s"}));}
        pot.classList.add("watered");splashSound();
        var after=plantStage(p.w);
        setTimeout(function(){
          if(after===3&&before<3){S.bouquet++;save();confetti(120);sfx("fanfare");say((p.name||k.name)+" bloomed!");}
          else if(after>before){sfx("sparkle");say("It grew a little.");}
          paint();
        },700);
      });
      potsBox.append(pot);
    });
    addBox.replaceChildren();
    if(S.garden.length<6)addBox.append(seedCard());
    else addBox.append(h("p",{class:"small"},"Your garden is full. That is a lot of growing."));
  }
  function splashSound(){whoosh(.5);}
  function seedCard(){
    var kind=KINDS[0].id;
    var name=h("input",{type:"text",maxlength:"20",placeholder:"Name it, or plant a hope: "+pick(SEED_IDEAS),"aria-label":"Name this plant"});
    var row=h("div",{class:"seedrow",role:"radiogroup","aria-label":"Kind of flower"});
    KINDS.forEach(function(k){
      var b=h("button",{class:"kindbtn"+(k.id===kind?" on":""),type:"button",role:"radio","aria-checked":k.id===kind?"true":"false"},h("i",{style:"background:"+k.col}),k.name);
      b.addEventListener("click",function(){kind=k.id;row.querySelectorAll(".kindbtn").forEach(function(c){c.classList.remove("on");c.setAttribute("aria-checked","false");});b.classList.add("on");b.setAttribute("aria-checked","true");});
      row.append(b);
    });
    return h("div",{class:"card"},h("h2",null,"Plant a seed"),row,name,
      h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){
        S.garden.push({id:uid(),kind:kind,name:name.value.trim().slice(0,20),w:0,last:""});markAct();save();sfx("done");paint();
      }},"Plant it")));
  }
  paint();
  w.append(potsBox,addBox);
  if(S.bouquet>0)w.append(h("p",{class:"small",style:"text-align:center"},"Flowers you have grown so far: "+S.bouquet+"."));
  return w;
}

/* ---- someday list ---- */
function viewSomeday(){
  var w=h("section",{class:"view"});
  w.append(pageHead("Someday list","Things worth looking forward to. Small or huge, near or far. No deadlines."));
  var wishCard=h("div",{class:"card"});
  function paintWishes(){
    wishCard.replaceChildren(h("h2",null,"My own list"));
    var input=h("input",{type:"text",maxlength:"120",placeholder:"Something I would like to do or see","aria-label":"New wish"});
    function add(){var v=input.value.trim();if(!v)return;S.wishes.push({id:uid(),t:Date.now(),text:v,done:false});markAct();save();sfx("done");paintWishes();}
    input.addEventListener("keydown",function(e){if(e.key==="Enter")add();});
    wishCard.append(h("div",{class:"row",style:"flex-wrap:nowrap"},input,h("button",{class:"btn",type:"button",onclick:add,style:"flex:none"},"Add")));
    S.wishes.forEach(function(x){
      var b=h("button",{class:"check",type:"button",role:"checkbox","aria-checked":x.done?"true":"false"},
        h("span",{class:"box",html:x.done?'<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7.5l3.2 3L12 3.5"/></svg>':""}),
        h("span",{class:"t"},x.text));
      b.addEventListener("click",function(){x.done=!x.done;if(x.done){sfx("fanfare");confetti(60);markAct();}save();paintWishes();});
      var rm=h("button",{class:"rm",type:"button","aria-label":"Remove "+x.text,onclick:function(){S.wishes=S.wishes.filter(function(y){return y.id!==x.id;});save();paintWishes();}},"Remove");
      wishCard.append(h("div",{style:"display:flex;gap:6px;align-items:center"},h("div",{style:"flex:1;min-width:0"},b),rm));
    });
    if(!S.wishes.length)wishCard.append(h("p",{class:"small"},"Nothing here yet. It can be as small as a coffee with someone."));
  }
  paintWishes();
  w.append(wishCard);
  function placeCardBtn(p){
    return h("button",{class:"pc-card",type:"button",onclick:function(){sfx("tick");go("place-"+p.id);}},
      postcardEl(p),h("strong",null,p.name),h("span",{class:"small"},S.arrived[p.id]?"Been there":p.area));
  }
  w.append(h("h2",null,"Close to home"),h("div",{class:"grid2"},PLACES.filter(function(p){return p.near;}).map(placeCardBtn)));
  w.append(h("h2",null,"Dream trips"),h("div",{class:"grid2"},PLACES.filter(function(p){return !p.near;}).map(placeCardBtn)));
  return w;
}
function viewPlace(id){
  var p=PLACE[id];
  if(!p)return viewSomeday();
  var w=h("section",{class:"view"});
  w.append(postcardEl(p,{cap:p.area}));
  w.append(h("div",null,h("h1",{class:"display"},p.name),h("p",{class:"lede",style:"margin-top:6px"},p.blurb)));
  w.append(h("div",{class:"card sky"},h("div",{class:"label",style:"color:inherit;opacity:.8"},"Did you know"),h("p",null,p.fact)));
  var goals=S.goals[p.id]||[false,false,false];
  var gbox=h("div",{class:"card"});
  gbox.append(h("h2",null,"Make it real"),h("p",{class:"small"},"Three small steps that turn a dream into a plan. Tick them off in any order."));
  p.steps.forEach(function(txt,i){
    var b=h("button",{class:"check",type:"button",role:"checkbox","aria-checked":goals[i]?"true":"false"},
      h("span",{class:"box",html:goals[i]?'<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7.5l3.2 3L12 3.5"/></svg>':""}),
      h("span",{class:"t"},txt));
    b.addEventListener("click",function(){
      var arr=(S.goals[p.id]||[false,false,false]).slice();
      arr[i]=!arr[i];S.goals[p.id]=arr;
      if(arr[i]){sfx("done");markAct();}
      save();go("place-"+p.id);
    });
    gbox.append(b);
  });
  w.append(gbox);
  var been=!!S.arrived[p.id];
  w.append(h("div",{class:"card"},
    h("h2",null,been?"You went":"Been here?"),
    h("p",{class:"small"},been?"Marked on "+fmtDate(S.arrived[p.id])+".":"When you go, mark it. Pip will celebrate."),
    h("div",{class:"row"},h("button",{class:been?"btn quiet":"btn popbtn",type:"button",onclick:function(){
      if(been)delete S.arrived[p.id];else{S.arrived[p.id]=Date.now();confetti(140);sfx("fanfare");markAct();}
      save();go("place-"+p.id);
    }},been?"Undo":"I went here"))));
  return w;
}

/* ================= SETTINGS ================= */
var armRestore=false,armErase=false;
function viewSettings(){
  armRestore=false;armErase=false;
  var w=h("section",{class:"view"});
  w.append(pageHead("Settings"));
  /* colours */
  var palCard=h("div",{class:"card"});
  function paintPal(){
    palCard.replaceChildren(h("h2",null,"Colours"),h("p",{class:"small"},"People respond to colour differently, so you decide. Right now Harbor is using the "+MOODS[paletteLevel()-1].label.toLowerCase()+" palette."));
    var opts=[
      ["mood","Match my mood","Gentle and warm when you feel heavy, brighter and livelier when you feel good."],
      ["lift","Lift me a little","Always one step brighter than your mood, never harsh."],
      ["soft","Keep it soft","Calm, warm and quiet, whatever your mood."]
    ];
    opts.forEach(function(o){
      var b=h("button",{class:"palopt",type:"button",role:"radio","aria-checked":S.palette===o[0]?"true":"false"},h("strong",null,o[1]),h("span",{class:"small"},o[2]));
      b.addEventListener("click",function(){S.palette=o[0];save();applyPalette();sfx("tick");paintPal();});
      palCard.append(b);
    });
    palCard.append(h("div",{class:"label"},"What each mood looks like"));
    var sw=h("div",{class:"swatches"}),dark=isDark();
    MOODS.forEach(function(m){
      var v=palVars(m.n,null,dark);
      sw.append(h("div",{class:"swatch",style:"background:"+v["--bg"]+";color:"+v["--ink"]},
        h("span",{class:"d"},h("i",{style:"background:"+v["--q-feel"]}),h("i",{style:"background:"+v["--q-calm"]}),h("i",{style:"background:"+v["--q-play"]}),h("i",{style:"background:"+v["--q-grow"]})),m.label));
    });
    palCard.append(sw);
  }
  paintPal();
  w.append(palCard);
  w.append(h("div",{class:"card"},h("h2",null,"Sound and motion"),
    toggleRow("Little sounds","Soft boops, pops and chimes when you tap things.",S.fx,function(v){S.fx=v;save();if(v)sfx("boop");}),
    toggleRow("Keep things still","Turns off animations, confetti and moving games.",S.still,function(v){S.still=v;applyStill();save();})));
  w.append(voiceCard());

  var backupBox=h("textarea",{id:"backupBox",rows:"4",readonly:true,"aria-label":"Backup text"});
  backupBox.value=JSON.stringify(S);
  var restoreBox=h("textarea",{id:"restoreBox",rows:"3",placeholder:"Paste a backup here to restore it","aria-label":"Restore text"});
  var restoreBtn=h("button",{class:"btn ghost",type:"button"},"Restore from backup");
  restoreBtn.addEventListener("click",function(){
    var raw=restoreBox.value.trim();
    if(!raw){say("Paste a backup first");return;}
    var parsed;
    try{parsed=JSON.parse(raw);}catch(e){say("That does not look like a Harbor backup");return;}
    if(!parsed||typeof parsed!=="object"||!Array.isArray(parsed.entries)){say("That does not look like a Harbor backup");return;}
    if(!armRestore){armRestore=true;restoreBtn.textContent="Tap again to replace everything here";return;}
    S=normalize(parsed);S.intro=true;applyStill();save();applyPalette();go("settings");say("Backup restored");
  });
  w.append(h("div",{class:"card"},
    h("h2",null,"Backup"),
    h("p",{class:"small"},"Your data lives only in this browser. If you clear site data or switch phones, it is gone. Copy this text somewhere safe, like a note to yourself."),
    backupBox,
    h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){backupBox.value=JSON.stringify(S);copyText(backupBox.value,"Backup copied");}},"Copy backup")),
    restoreBox,h("div",{class:"row"},restoreBtn)));
  w.append(h("div",{class:"card"},
    h("h2",null,"Privacy and limits"),
    h("p",null,"Harbor has no account, no ads, and no tracking. What you write is saved only on this device. Nothing is sent anywhere. All sounds are made on your phone, and all pictures are drawings, not photos."),
    h("p",null,"Harbor is a support tool and not a therapist. If things feel too big, please talk to a person who can help."),
    h("div",{class:"row"},h("button",{class:"btn ghost",type:"button",onclick:function(){go("help");}},"Helplines"))));
  var eraseBtn=h("button",{class:"btn quiet",type:"button"},"Erase everything on this device");
  eraseBtn.addEventListener("click",function(){
    if(!armErase){armErase=true;eraseBtn.textContent="Tap again to erase for good";return;}
    S=fresh();S.intro=true;applyStill();save();applyPalette();go("home");say("Everything erased");
  });
  w.append(h("div",{class:"row"},eraseBtn));
  return w;
}

/* ================= HELP ================= */
var LINES=[
  {name:"Befrienders Mauritius",note:"Free and confidential listening and support by phone or text. English and French.",num:"800 93 93",tel:"800 93 93"},
  {name:"Befrienders Mauritius, mobile or WhatsApp",note:"Alternate number if you cannot use the free line.",num:"+230 5831 5551",tel:"+23058315551"},
  {name:"Life Plus",note:"Free support across Mauritius. 188 from a landline.",num:"466 5310",tel:"4665310"},
  {name:"Helpline Mauritius",note:"Free listening and counselling across Mauritius and Rodrigues.",num:"+230 214 2451",tel:"+2302142451"}
];
function viewHelp(){
  var w=h("section",{class:"view"});
  w.append(h("h1",{class:"display"},"Talk to someone"),
    h("p",{class:"lede"},"You do not have to carry this alone. These lines are free, and a real person will listen."));
  w.append(h("div",{class:"card helpcard"},
    h("h2",null,"In immediate danger?"),
    h("p",null,"Call an ambulance on 114 or the police on 999, or go to the nearest hospital."),
    h("div",{class:"row"},
      h("a",{class:"btn",href:"tel:114"},"Call 114"),
      h("a",{class:"btn ghost",href:"tel:999",style:"color:inherit;border-color:currentColor"},"Call 999"))));
  LINES.forEach(function(l){
    w.append(h("div",{class:"card helpline"},
      h("h2",null,l.name),h("p",{class:"small"},l.note),h("div",{class:"num"},l.num),
      h("div",{class:"row"},
        h("a",{class:"btn",href:"tel:"+l.tel},"Call"),
        h("button",{class:"btn ghost",type:"button",onclick:function(){copyText(l.num,"Number copied");}},"Copy number"))));
  });
  w.append(h("p",{class:"small"},"Not in Mauritius? ",
    h("a",{href:"https://findahelpline.com",target:"_blank",rel:"noopener noreferrer"},"findahelpline.com"),
    " lists free helplines by country. Numbers were checked in October 2026 and can change, so if one does not connect, try another."));
  return w;
}

/* ================= router ================= */
var VIEWS={home:viewHome,feel:viewFeel,checkin:viewCheckin,letgo:viewLetgo,tide:viewTide,
  calm:viewCalm,sounds:viewSounds,scenes:viewScenes,breathe:viewBreathe,guided:viewGuided,
  play:viewPlay,bubbles:viewBubbles,sheep:viewSheep,harp:viewHarp,wardrobe:viewWardrobe,silly:viewSilly,
  grow:viewGrow,step:viewSteps,jar:viewJar,garden:viewGarden,someday:viewSomeday,settings:viewSettings,help:viewHelp};
var PARENT={feel:"home",calm:"home",play:"home",grow:"home",settings:"home",
  checkin:"feel",letgo:"feel",tide:"feel",
  sounds:"calm",scenes:"calm",breathe:"calm",guided:"calm",
  bubbles:"play",sheep:"play",harp:"play",wardrobe:"play",silly:"play",
  step:"grow",jar:"grow",garden:"grow",someday:"grow"};
var TITLES={home:"Home",feel:"Feel",calm:"Calm",play:"Play",grow:"Grow",someday:"Someday"};
var HUB_FOR={feel:"feel",checkin:"feel",letgo:"feel",tide:"feel",calm:"calm",sounds:"calm",scenes:"calm",breathe:"calm",guided:"calm",
  play:"play",bubbles:"play",sheep:"play",harp:"play",wardrobe:"play",silly:"play",grow:"grow",step:"grow",jar:"grow",garden:"grow",someday:"grow"};
var lastMain="home";
function resolve(name){
  if(name.indexOf("place-")===0&&PLACE[name.slice(6)])return name;
  return VIEWS[name]?name:"home";
}
function parentOf(name){
  if(name==="help")return lastMain||"home";
  if(name.indexOf("place-")===0)return "someday";
  return PARENT[name]||"home";
}
function route(name){
  name=resolve(name);
  current=name;
  if(name!=="help")lastMain=name;
  if(cleanup){var c=cleanup;cleanup=null;try{c();}catch(e){}}
  closeSheet();
  var hub=name.indexOf("place-")===0?"grow":(HUB_FOR[name]||null);
  applyPalette(hub);
  var app=document.getElementById("app");
  var view=name.indexOf("place-")===0?viewPlace(name.slice(6)):VIEWS[name]();
  app.replaceChildren(view);
  var home=name==="home";
  document.getElementById("mark").hidden=!home;
  var back=document.getElementById("btnBack");
  back.hidden=home;
  var par=parentOf(name);
  document.getElementById("backLabel").textContent=TITLES[par]||(par.charAt(0).toUpperCase()+par.slice(1));
  document.getElementById("btnHome").hidden=home||par==="home";
  document.getElementById("btnSettings").hidden=!home;
  document.getElementById("btnHelp").hidden=name==="help";
  try{window.scrollTo(0,0);}catch(e){}
}
function go(name){
  closeScene();
  current=resolve(name);
  try{if(location.hash!=="#"+name)location.hash=name;}catch(e){}
  route(name);
}
window.addEventListener("hashchange",function(){
  var n=resolve((location.hash||"").replace("#",""));
  if(n!==current){closeScene();route(n);}
});
document.getElementById("btnBack").addEventListener("click",function(){go(parentOf(current));});
document.getElementById("btnHome").addEventListener("click",function(){go("home");});
document.getElementById("btnSettings").addEventListener("click",function(){go("settings");});
document.getElementById("btnHelp").addEventListener("click",function(){go("help");});
document.getElementById("btnSound").addEventListener("click",function(){go("sounds");});

route((location.hash||"").replace("#","")||"home");
