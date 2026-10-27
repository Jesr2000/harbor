import re
old=open('harbor_v2_backup.html').read().split('\n')
def L(a,b): return '\n'.join(old[a-1:b])  # inclusive 1-indexed
css=L(1,267)
# patch old css
css=css.replace("padding-block:0 108px;","padding-block:0 32px;")
css=css.replace("bottom:calc(88px + env(safe-area-inset-bottom,0px));max-width:min(92vw,420px)","bottom:calc(24px + env(safe-area-inset-bottom,0px));max-width:min(92vw,420px)")
new=open('v3/new.css').read()
body=open('v3/body.html').read()
parts=[]
parts.append(open('v3/core.js').read())
parts.append(L(358,441))                 # helpers
parts.append(open('v3/audio.js').read())
parts.append(open('v3/voice_data.js').read() if __import__('os').path.exists('v3/voice_data.js') else 'var VLINES=[],VCLIPS={};')
parts.append(L(617,754))                 # content + places
parts.append(open('v3/content_new.js').read())
parts.append(open('v3/art_new.js').read())
parts.append(L(767,777))                 # tide() old -> skip (new art has tide)
parts=parts[:-1]
parts.append(L(846,854) if False else '')
parts.append(L(855,938))                 # SCENES
parts.append(L(967,1030))                # stars + DRAW
parts.append(open('v3/scenes_new.js').read())
parts.append(open('v3/views1.js').read())
parts.append(open('v3/views2.js').read())
parts.append(open('v3/views3.js').read())
parts.append(open('v3/views4.js').read())
js='\n'.join(parts)
out=css+'\n'+new+'</style>\n'+body+'\n<script>\n(function(){\n"use strict";\n'+js+'\n})();\n</script>\n'
open('harbor.html','w').write(out)
open('harbor_check.js','w').write('(function(){\n"use strict";\n'+js+'\n})();\n')
print(len(out))
