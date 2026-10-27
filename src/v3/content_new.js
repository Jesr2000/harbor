
/* ---- v3 content ---- */
var SCRIPTS={
  night:[
    "Nothing needs fixing right now.",
    "Let your shoulders drop, just a little.",
    "Picture a quiet sea at night. The moon is resting on the water.",
    "Each wave comes in, and each wave goes out. You do not have to help it.",
    "Breathe in slowly. Breathe out even slower.",
    "Whatever the day was, it is over now. You made it to this moment.",
    "Thoughts can drift by like boats in the distance. You do not have to climb aboard.",
    "Feel the weight of your body being held up. The ground has you.",
    "There is nowhere you need to be. Just here, just now.",
    "Rest here as long as you like."
  ],
  aurora:[
    "Look up. The whole sky is slowly waking up with colour.",
    "Green light, then violet, moving like silk in the wind.",
    "It has been doing this for thousands of years, without anyone's permission.",
    "You are allowed to just watch.",
    "Breathe in the cold, clean air. Let it out as a soft cloud.",
    "Even on dark nights, the sky has light in it.",
    "Let your eyes go soft and wide.",
    "Nothing is expected of you here.",
    "Rest here as long as you like."
  ],
  fireflies:[
    "It is a warm evening, and the grass is tall and quiet.",
    "Small lights are waking up, one at a time.",
    "They do not rush. They glow, and then they rest, and then they glow again.",
    "You can be like that too. Glowing is allowed. Resting is allowed.",
    "Breathe in the soft air. Breathe out whatever you are carrying.",
    "Each little light finds its own way, and there is room for all of them.",
    "You are safe in this field.",
    "Let your eyes follow one light for a while.",
    "Rest here as long as you like."
  ]
};
var PIP_LOW=[
  "I am right here. No rush.",
  "You do not have to do anything. I am happy just sitting with you.",
  "Even showing up today counts. I noticed.",
  "Want to hold me and fling me? Sometimes silly helps.",
  "Pick a square, or just sit here with me for a bit.",
  "Hard days are allowed. I will keep my lantern on."
];
var PIP_MID=[
  "Hello again! I practised looking surprised.",
  "Today feels like a good day for one small thing.",
  "My lantern is glowing because you are here.",
  "Tap a square, or hold me and pull back. Whee.",
  "I am a professional blob. It is going well."
];
var PIP_HIGH=[
  "Look at you! The colours are happy about it too.",
  "Good day detected. Should we play something?",
  "Let us save some of this light for later.",
  "Fling me! I am in the mood for whee."
];
var KINDS=[
  {id:"sun",name:"Sunflower",col:"#F2B632",ctr:"#6B4423"},
  {id:"tulip",name:"Tulip",col:"#E8607A",ctr:"#E8607A"},
  {id:"lav",name:"Lavender",col:"#9C7BD8",ctr:"#9C7BD8"},
  {id:"daisy",name:"Daisy",col:"#FFFFFF",ctr:"#F2B632"},
  {id:"blue",name:"Bluebell",col:"#5B8FE0",ctr:"#5B8FE0"}
];
var PLANT={};KINDS.forEach(function(k){PLANT[k.id]=k;});
var SEED_IDEAS=["Patience","Rest","Courage","Hope","Kindness"];
var FUN_FACT_PIP=FACTS;
var BREATH_PATTERNS={
  calm:{name:"Slow out",desc:"In 4, out 6",ph:[["in",4],["out",6]]},
  box:{name:"Box",desc:"In 4, hold 4, out 4, hold 4",ph:[["in",4],["hold",4],["out",4],["hold",4]]},
  relax:{name:"4-7-8",desc:"In 4, hold 7, out 8",ph:[["in",4],["hold",7],["out",8]]}
};
var GROUND=[
  {n:5,t:"Name 5 things you can see."},
  {n:4,t:"Name 4 things you can feel, like your feet on the floor."},
  {n:3,t:"Name 3 things you can hear."},
  {n:2,t:"Name 2 things you can smell."},
  {n:1,t:"Name 1 thing you can taste."}
];
var SOUND_PRESETS=[
  {name:"Calm sea",l:{ocean:.7,chimes:.3}},
  {name:"Rainy night",l:{rain:.7,pad:.35}},
  {name:"Cosy fire",l:{fire:.65,rain:.3}},
  {name:"Windy hill",l:{wind:.65,chimes:.35}},
  {name:"Starry night",l:{night:.6,bowl:.5,pad:.3}},
  {name:"Deep sleep",l:{ocean:.45,pad:.5}}
];
