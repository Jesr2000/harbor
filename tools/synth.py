import re, json, subprocess, os, sys, time
import numpy as np, onnxruntime as ort
os.environ['LD_LIBRARY_PATH']='/tmp/tts/piper'
VOCAB=json.load(open('/tmp/tts/kokoro-onnx/src/kokoro_onnx/config.json'))['vocab']
sess=ort.InferenceSession('/tmp/tts/kokoro.onnx',providers=['CPUExecutionProvider'])
VOICES=np.load('/tmp/tts/voices.bin',allow_pickle=True)
def ipa(chunk):
    r=subprocess.run(['/tmp/tts/piper/espeak-ng','--path=/tmp/tts/piper','-q','--ipa','-v','en-us',chunk],capture_output=True,text=True,env=os.environ)
    return ' '.join(r.stdout.replace('_','').split())
def phonemize(sentence):
    parts=re.findall(r'[^.,;:!?—…]+|[.,;:!?—…]',sentence)
    out=''
    for p in parts:
        if re.match(r'[.,;:!?—…]',p): out=out.rstrip()+p+' '
        else:
            if p.strip(): out+=ipa(p.strip())
    return ''.join(c for c in out if c in VOCAB).strip()
def synth_sentence(sentence,voice,speed):
    ph=phonemize(sentence)
    ids=[VOCAB[c] for c in ph if c in VOCAB][:510]
    style=VOICES[voice][len(ids)-1]
    a=sess.run(None,{'tokens':np.array([[0,*ids,0]],dtype=np.int64),'style':np.asarray(style,dtype=np.float32),'speed':np.array([speed],dtype=np.float32)})[0]
    return a.flatten()
def trim(a,thr=0.004):
    idx=np.where(np.abs(a)>thr)[0]
    if len(idx)==0: return a
    return a[max(0,idx[0]-1200):idx[-1]+2400]
def synth(text,voice,speed=0.82,gap=0.45):
    sents=[s.strip() for s in re.findall(r'[^.!?]+[.!?]?',text) if s.strip()]
    segs=[];sr=24000
    for i,s in enumerate(sents):
        segs.append(trim(synth_sentence(s,voice,speed)))
        if i<len(sents)-1: segs.append(np.zeros(int(sr*gap),dtype=np.float32))
    return np.concatenate(segs)
if __name__=='__main__':
    t=time.time(); a=synth("Nothing needs fixing right now. Let your shoulders drop, just a little.",'af_nicole')
    print(len(a)/24000,'s audio in',time.time()-t,'s; peak',np.abs(a).max())
    import scipy.io.wavfile as w; w.write('/tmp/tts/test.wav',24000,(a/np.abs(a).max()*0.89*32767).astype(np.int16))
