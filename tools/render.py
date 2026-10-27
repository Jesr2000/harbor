import json, numpy as np, subprocess, os, sys
import scipy.io.wavfile as w
from synth import synth
lines=json.load(open('lines.json'))
voices=sys.argv[1:]
for v in voices:
    os.makedirs(f'out_{v}',exist_ok=True)
    for i,t in enumerate(lines):
        fn=f'out_{v}/{i:02d}.mp3'
        if os.path.exists(fn): continue
        a=synth(t,v,speed=0.82,gap=0.5)
        rms=np.sqrt(np.mean(a**2))+1e-9
        a=a*(0.075/rms); a=np.clip(a,-0.95,0.95)
        w.write('tmp_%s.wav'%v,24000,(a*32767).astype(np.int16))
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i','tmp_%s.wav'%v,'-ac','1','-ar','24000','-b:a','32k',fn],check=True)
        print(v,i,len(a)/24000,flush=True)
