import json,base64,os
lines=json.load(open('/tmp/tts/lines.json'))
names={'nicole':'af_nicole','heart':'af_heart','emma':'bf_emma'}
out='var VLINES='+json.dumps(lines)+';\nvar VCLIPS={};\n'
for k,v in names.items():
    arr=[]
    for i in range(len(lines)):
        arr.append(base64.b64encode(open(f'/tmp/tts/out_{v}/{i:02d}.mp3','rb').read()).decode())
    out+='VCLIPS.'+k+'='+json.dumps(arr)+';\n'
open('v3/voice_data.js','w').write(out); print(len(out))
