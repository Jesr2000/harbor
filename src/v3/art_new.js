/* ================= art (v3) ================= */
var gid=0;
var ICON={
  feel:'<path d="M12 20.5s-8-4.7-8-10.2C4 7 6.2 5 8.7 5c1.5 0 2.7.8 3.3 1.9C12.6 5.8 13.800 5 15.3 5 17.800 5 20 7 20 10.300c0 5.500-8 10.200-8 10.200z"/>',
  calm:'<path d="M2 9c3-3 5 3 8 0s5 3 8 0 3 0 4-1M2 15c3-3 5 3 8 0s5 3 8 0 3 0 4-1"/>',
  play:'<path d="M12 3l2.600 5.600 6.100.7-4.500 4.200 1.200 6L12 16.500 6.600 19.500l1.200-6L3.300 9.300l6.100-.7z"/>',
  grow:'<path d="M12 21v-9M12 12c0-4 3-6.500 7-6.500 0 4-3 6.500-7 6.500zM12 15c0-3-2.200-5-5.500-5 0 3 2.200 5 5.500 5z"/>',
  checkin:'<path d="M7 4h10v14a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><path d="M7 12c2-1.200 3 1.200 5 0s3 1.200 5 0"/>',
  letgo:'<path d="M12 3c-3.500 0-6 2.600-6 6 0 3.600 3 6.200 6 7 3-.8 6-3.400 6-7 0-3.400-2.500-6-6-6z"/><path d="M12 16l-1 2h2zM12 18c-1 1.500 1 2.500 0 4"/>',
  tide:'<path d="M4 20v-6M9 20V8M14 20v-9M19 20V5"/>',
  sounds:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.500 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/>',
  scenes:'<path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500z"/>',
  breathe:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8.500"/>',
  guided:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z"/>',
  bubbles:'<circle cx="9" cy="14.500" r="5.500"/><circle cx="17" cy="7" r="3"/><path d="M6.500 12.500a3 3 0 0 1 2-1.500"/>',
  sheep:'<path d="M6 17.500a3.500 3.500 0 0 1-.5-7A4.500 4.500 0 0 1 14 8.500 4 4 0 0 1 18 17.500z"/><path d="M8 17.500v3M15 17.500v3"/>',
  harp:'<path d="M6 21c0-8 2-14 6-17 4 3 6 9 6 17"/><path d="M9.500 9v11M12 7v13M14.500 9v11"/>',
  hat:'<path d="M3 18.500h18"/><path d="M6 18.500c0-6 2.500-12 6-12s6 6 6 12"/>',
  silly:'<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 2.500 3 4 3s3-1 4-3M9 9.500v.5M15 9.500v.5"/>',
  step:'<path d="M4 20h5v-5h5v-5h6"/>',
  jar:'<path d="M8 3h8M9 3v3M15 3v3M7 9c0-1.700 1.300-3 3-3h4c1.700 0 3 1.300 3 3v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><path d="M12 11l1 2 2 .3-1.500 1.400.4 2.100-1.900-1-1.900 1 .4-2.100L9 13.300l2-.3z"/>',
  garden:'<path d="M7 15h10l-1.500 6h-7z"/><path d="M12 15V9M12 11c0-2.500 2-4 4.500-4 0 2.500-2 4-4.500 4zM12 13c0-2-1.500-3.500-4-3.500 0 2 1.500 3.500 4 3.500z"/>',
  someday:'<path d="M12 21s6-5.500 6-11a6 6 0 0 0-12 0c0 5.500 6 11 6 11z"/><circle cx="12" cy="10" r="2.200"/>',
  chev:'<path d="M9 5l7 7-7 7"/>'
};
function ico(name,cls){
  return h("span",{html:'<svg viewBox="0 0 24 24" aria-hidden="true"'+(cls?' class="'+cls+'"':'')+'>'+ICON[name]+'</svg>',style:"display:contents"});
}
function icoStr(name,cls){return '<svg viewBox="0 0 24 24" aria-hidden="true"'+(cls?' class="'+cls+'"':'')+'>'+ICON[name]+'</svg>';}
/* the big square-corner pictures on the home screen */
function quadArt(id){
  var P={
    feel:'<circle class="soft" cx="24" cy="26" r="20"/><path d="M24 40s-13-7.500-13-16.500C11 18.500 14.500 15 18.800 15c2.400 0 4.300 1.200 5.200 3 .9-1.800 2.800-3 5.200-3C33.500 15 37 18.500 37 23.500 37 32.500 24 40 24 40z"/>',
    calm:'<circle class="soft" cx="24" cy="26" r="20"/><path d="M6 20c4-4 7 4 11 0s7 4 11 0 6 0 8-1.500M6 29c4-4 7 4 11 0s7 4 11 0 6 0 8-1.500"/>',
    play:'<circle class="soft" cx="24" cy="26" r="20"/><path d="M24 8l4.500 10 11 1.200-8.200 7.500 2.300 10.800L24 31.500 14.400 37.500l2.300-10.800L8.500 19.200l11-1.200z"/>',
    grow:'<circle class="soft" cx="24" cy="26" r="20"/><path d="M24 42V24M24 24c0-8 6-13 14-13 0 8-6 13-14 13zM24 31c0-6-4.500-10-11-10 0 6 4.500 10 11 10z"/>'
  };
  return '<svg class="qi" viewBox="0 0 48 48" aria-hidden="true">'+P[id]+'</svg>';
}
function tide(level){
  var id="tc"+(gid++);
  var inner=32,top=6,hgt=inner*(level/5),y=top+inner-hgt;
  var vessel="M6 4h20v32a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z";
  return h("span",{html:
    '<svg viewBox="0 0 32 44" fill="none" aria-hidden="true">'+
    '<clipPath id="'+id+'"><path d="'+vessel+'"/></clipPath>'+
    '<rect class="water" x="6" y="'+y.toFixed(1)+'" width="20" height="'+hgt.toFixed(1)+'" clip-path="url(#'+id+')"/>'+
    '<path d="'+vessel+'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    style:"display:contents"});
}

/* ---- Pip ---- */
function hatSvg(id){
  if(id==="party")return '<g transform="rotate(-13 44 36)"><path d="M28 37 L44 3 L60 37 Z" fill="#E8628F"/><path d="M33 28 L55 28 M37 19 L51 19" stroke="#FFE08A" stroke-width="3"/><circle cx="44" cy="3" r="4.500" fill="#FFD25E"/></g>';
  if(id==="crown")return '<g transform="rotate(-10 44 36)"><path d="M27 38 L29 15 L38 26 L45 10 L52 26 L61 15 L63 38 Z" fill="#F2C03F" stroke="#C99A1F" stroke-width="1.5" stroke-linejoin="round"/><circle cx="45" cy="30" r="3" fill="#E8628F"/><circle cx="33" cy="32" r="2" fill="#5B8FE0"/><circle cx="57" cy="32" r="2" fill="#5B8FE0"/></g>';
  if(id==="sailor")return '<g transform="rotate(-9 44 36)"><ellipse cx="45" cy="36" rx="22" ry="5.500" fill="#fff"/><path d="M27 36 Q27 14 45 14 Q63 14 63 36 Z" fill="#fff"/><path d="M27 31 H63" stroke="#2B5D9E" stroke-width="4"/><circle cx="45" cy="25" r="2.500" fill="#2B5D9E"/></g>';
  if(id==="flower")return '<g transform="translate(40 34)"><g fill="#F7A8C2"><circle cx="0" cy="-8" r="5.500"/><circle cx="8" cy="-2" r="5.500"/><circle cx="5" cy="7" r="5.500"/><circle cx="-5" cy="7" r="5.500"/><circle cx="-8" cy="-2" r="5.500"/></g><circle cx="0" cy="1" r="4.500" fill="#FFD25E"/></g>';
  if(id==="beanie")return '<g transform="rotate(-9 44 36)"><path d="M28 38 Q28 10 45 10 Q62 10 62 38 Z" fill="#D9644A"/><path d="M29 30 H61 M30 22 H60" stroke="#F4D7B0" stroke-width="3"/><rect x="27" y="34" width="36" height="7" rx="3.500" fill="#B84C36"/><circle cx="45" cy="8" r="5.500" fill="#F4D7B0"/></g>';
  return '';
}
function pipSvg(hat,level){
  var d=({1:4,2:6,3:8,4:11,5:14})[level||3]||8;
  var mouth=level===5?'<path d="M50 80 Q60 96 70 80 Z" fill="#14262D" stroke="#14262D" stroke-width="2" stroke-linejoin="round"/><path d="M54 87 Q60 92 66 87" fill="#F08A70"/>':'<path d="M51 81 Q60 '+(81+d)+' 69 81" stroke="#14262D" stroke-width="2.600" fill="none" stroke-linecap="round"/>';
  return '<svg class="pip-svg" viewBox="0 0 120 134" aria-hidden="true">'+
  '<ellipse cx="60" cy="126" rx="30" ry="5" fill="#000" opacity=".14"/>'+
  '<ellipse class="wing-l" cx="19" cy="84" rx="9" ry="15" fill="var(--pip)"/>'+
  '<ellipse class="wing-r" cx="101" cy="84" rx="9" ry="15" fill="var(--pip)"/>'+
  '<ellipse cx="60" cy="76" rx="41" ry="46" fill="var(--pip)"/>'+
  '<ellipse cx="60" cy="88" rx="27" ry="31" fill="var(--pip-belly)"/>'+
  (hat&&hat!=="none"&&hat!=="shades"?hatSvg(hat):'')+
  '<g><path d="M60 30 C58 16 66 10 74 8" stroke="var(--pip)" stroke-width="3.200" fill="none" stroke-linecap="round"/>'+
  '<circle class="lamp-glow" cx="75" cy="8" r="12" fill="var(--glow)" opacity=".4"/><circle cx="75" cy="8" r="6" fill="var(--glow)"/></g>'+
  '<g class="pip-eyes"><ellipse cx="45" cy="64" rx="9.500" ry="10.500" fill="#fff"/><ellipse cx="75" cy="64" rx="9.500" ry="10.500" fill="#fff"/>'+
  '<g class="pip-pupils"><circle cx="47" cy="66" r="5.200" fill="#14262D"/><circle cx="77" cy="66" r="5.200" fill="#14262D"/>'+
  '<circle cx="49" cy="63.500" r="1.900" fill="#fff"/><circle cx="79" cy="63.500" r="1.900" fill="#fff"/></g></g>'+
  (hat==="shades"?'<g><rect x="32" y="56" width="26" height="16" rx="6" fill="#14262D"/><rect x="62" y="56" width="26" height="16" rx="6" fill="#14262D"/><path d="M58 62 H62" stroke="#14262D" stroke-width="3"/><path d="M36 60 l6 0 M66 60 l6 0" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/></g>':'')+
  '<circle cx="31" cy="82" r="5.500" fill="#F08A70" opacity=".6"/><circle cx="89" cy="82" r="5.500" fill="#F08A70" opacity=".6"/>'+
  mouth+
  '<ellipse cx="46" cy="121" rx="11" ry="4.500" fill="#E8A24A"/><ellipse cx="74" cy="121" rx="11" ry="4.500" fill="#E8A24A"/>'+
  '</svg>';
}
/* eyes follow the finger or cursor */
var look={x:-1,y:-1,raf:0,idle:null};
function updateLook(){
  look.raf=0;
  var list=document.querySelectorAll(".pip-pupils"),i;
  for(i=0;i<list.length;i++){
    var g=list[i],r=g.ownerSVGElement?g.ownerSVGElement.getBoundingClientRect():null;
    if(!r||!r.width)continue;
    var cx=r.left+r.width/2,cy=r.top+r.height*.55;
    var tx=look.idle?look.idle.x:look.x,ty=look.idle?look.idle.y:look.y;
    if(tx<0&&!look.idle){g.style.transform="";continue;}
    var dx=tx-cx,dy=ty-cy,dist=Math.hypot(dx,dy)||1,k=Math.min(1,dist/140)*3.4;
    g.style.transform="translate("+(dx/dist*k).toFixed(2)+"px,"+(dy/dist*k).toFixed(2)+"px)";
  }
}
function queueLook(){if(!look.raf)look.raf=requestAnimationFrame(updateLook);}
document.addEventListener("pointermove",function(e){look.x=e.clientX;look.y=e.clientY;queueLook();},{passive:true});
document.addEventListener("pointerdown",function(e){look.x=e.clientX;look.y=e.clientY;queueLook();},{passive:true});
function glanceAround(){
  if(reduced())return;
  var r=document.body.getBoundingClientRect(),n=0;
  look.idle={x:rnd(20,r.width-20),y:rnd(120,Math.max(300,window.innerHeight-80))};queueLook();
  setTimeout(function(){look.idle={x:rnd(20,r.width-20),y:rnd(120,Math.max(300,window.innerHeight-80))};queueLook();},900);
  setTimeout(function(){look.idle=null;queueLook();},1900);
  n=0;
}
var lastPipLine="";
function pipLine(){
  var lvl=moodLevel(),pool=lvl<=2?PIP_LOW:(lvl>=4?PIP_HIGH:PIP_MID);
  var all=Math.random()<.55?pool:PIPLINES;
  var t=pick(all,lastPipLine);lastPipLine=t;return t;
}
/* Pip: kind is "mini" (hub corner), "big" (wardrobe). The home screen builds its own gesture on top. */
function pipWidget(kind,onSay){
  var big=kind==="big";
  var wrap=h("div",{class:"pip"+(big?" big":""),role:"button",tabindex:"0","aria-label":"Pip. Tap for a surprise"});
  var bub=onSay?null:h("div",{class:"bubble-speech",hidden:true});
  var art=h("div",{class:"pip-art",html:pipSvg(S.hat,moodLevel())});
  var zz=h("div",{class:"zzz","aria-hidden":"true"},"z z");
  wrap.append(art,zz);
  if(bub)wrap.append(bub);
  var tmr=null;
  function show(t,ms){
    if(onSay){onSay(t);return;}
    bub.textContent=t;bub.hidden=false;bub.classList.remove("show");void bub.offsetWidth;bub.classList.add("show");
    clearTimeout(tmr);tmr=setTimeout(function(){bub.hidden=true;},ms||5200);
  }
  function squish(){art.classList.remove("squish");void art.offsetWidth;art.classList.add("squish");}
  function poke(){
    sfx("boop");squish();show(pipLine());
  }
  if(kind!=="home")wrap.addEventListener("click",poke);
  wrap.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();poke();}});
  wrap.poke=poke;
  wrap.hello=function(t){show(t,6500);};
  wrap.showLine=show;
  wrap.art=art;
  wrap.setHat=function(hat){art.innerHTML=pipSvg(hat,moodLevel());};
  wrap.act=function(cls,ms){wrap.classList.remove(cls);void wrap.offsetWidth;wrap.classList.add(cls);setTimeout(function(){wrap.classList.remove(cls);},ms||900);};
  return wrap;
}
function chestSvg(){
  return '<svg class="chest" viewBox="0 0 120 100" aria-hidden="true">'+
  '<rect x="14" y="44" width="92" height="46" rx="8" fill="#A9683A"/><rect x="14" y="62" width="92" height="6" fill="#7E4A27"/>'+
  '<rect x="54" y="52" width="12" height="18" rx="3" fill="#E3A64B"/>'+
  '<g class="lid"><path d="M14 44 V34 Q14 14 60 14 Q106 14 106 34 V44 Z" fill="#C98147"/><path d="M14 36 H106" stroke="#7E4A27" stroke-width="5"/><rect x="54" y="30" width="12" height="14" rx="3" fill="#E3A64B"/></g>'+
  '<g class="spark"><path d="M106 12 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#FFD25E"/></g>'+
  '<g class="spark" style="animation-delay:.7s"><path d="M10 22 l1.500 4 4 1.500 -4 1.500 -1.500 4 -1.500 -4 -4 -1.500 4 -1.500z" fill="#FFD25E"/></g>'+
  '</svg>';
}
/* ---- garden plants ---- */
function plantStage(w){return w>=5?3:(w>=3?2:(w>=1?1:0));}
function plantSvg(kindId,stage){
  var k=PLANT[kindId]||KINDS[0],s='<svg viewBox="0 0 100 120" aria-hidden="true">',stem="#3E9B5E",leaf="#58B874";
  var cx=50;
  if(stage>=1){
    var top=stage===1?68:(stage===2?58:44);
    s+='<path d="M50 90 C50 '+(top+30)+' 50 '+(top+14)+' 50 '+top+'" stroke="'+stem+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
    s+='<ellipse cx="40" cy="'+(stage===1?74:76)+'" rx="10" ry="4.500" fill="'+leaf+'" transform="rotate(-28 40 '+(stage===1?74:76)+')"/>';
    s+='<ellipse cx="60" cy="'+(stage===1?70:70)+'" rx="10" ry="4.500" fill="'+leaf+'" transform="rotate(28 60 '+(stage===1?70:70)+')"/>';
    if(stage===2){s+='<ellipse cx="50" cy="52" rx="7" ry="10" fill="'+(k.col==="#FFFFFF"?"#E7EFE0":k.col)+'" opacity=".95"/><path d="M45 56 Q50 64 55 56" stroke="'+stem+'" stroke-width="2.500" fill="none"/>';}
    if(stage===3){
      var y=40,i,a;
      if(k.id==="tulip"){
        s+='<path d="M36 '+(y+2)+' Q34 '+(y-18)+' 42 '+(y-20)+' L46 '+(y-10)+' L50 '+(y-22)+' L54 '+(y-10)+' L58 '+(y-20)+' Q66 '+(y-18)+' 64 '+(y+2)+' Q50 '+(y+16)+' 36 '+(y+2)+'Z" fill="'+k.col+'"/>';
      }else if(k.id==="lav"){
        for(i=0;i<6;i++){s+='<ellipse cx="'+(i%2?45:55)+'" cy="'+(y-12+i*6)+'" rx="5" ry="3.800" fill="'+k.col+'"/>';}
        s+='<ellipse cx="50" cy="'+(y-18)+'" rx="4.500" ry="3.800" fill="'+k.col+'"/>';
      }else{
        var n=k.id==="blue"?5:9,pr=k.id==="blue"?10:8;
        for(i=0;i<n;i++){a=i*360/n;s+='<ellipse cx="50" cy="'+(y-12)+'" rx="'+(k.id==="blue"?7:4.500)+'" ry="'+pr+'" fill="'+k.col+'" stroke="rgba(0,0,0,.12)" stroke-width="1" transform="rotate('+a+' 50 '+y+')"/>';}
        s+='<circle cx="50" cy="'+y+'" r="'+(k.id==="blue"?5:8.500)+'" fill="'+k.ctr+'"/>';
      }
    }
  }else{
    s+='<ellipse cx="50" cy="88" rx="5" ry="3.500" fill="#6B4423"/>';
  }
  s+='<path d="M24 92 H76 L70 116 H30 Z" fill="#C0663B"/><rect x="21" y="86" width="58" height="9" rx="4" fill="#D17A4D"/><ellipse cx="50" cy="90" rx="26" ry="3" fill="#5A3A22" opacity=".55"/>';
  return s+'</svg>';
}
