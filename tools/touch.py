import re
from playwright.sync_api import sync_playwright
D='/tmp/claude-0/-home-claude/e56a7f90-54ed-5347-9f81-d7064a06fb18/scratchpad/'
src=open(D+'harbor.html').read(); src=re.sub(r'<link[^>]+>','',src)
open(D+'smoke_page.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+src+'</body></html>')
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox"])
    ctx=b.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+D+'smoke_page.html')
    pg.evaluate("localStorage.setItem('harbor.v1',JSON.stringify({v:3,intro:true}))"); pg.reload(); pg.wait_for_timeout(800)
    bb=pg.locator('.stage .pip').bounding_box(); cx=bb['x']+bb['width']/2; cy=bb['y']+bb['height']/2
    cdp=ctx.new_cdp_session(pg)
    def tp(t,x,y): cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y}] if t!='touchEnd' else []})
    tp('touchStart',cx,cy); pg.wait_for_timeout(300)
    for i in range(1,9): tp('touchMove',cx+i*8,cy-i*8); pg.wait_for_timeout(30)
    print('aim:',pg.evaluate("[...document.querySelectorAll('.quad')].map(q=>q.classList.contains('aim'))"))
    tp('touchEnd',0,0); pg.wait_for_timeout(1500)
    print('hash',pg.evaluate('location.hash'),'scrollY',pg.evaluate('scrollY'))
    # tap on pip (touch) -> poke line, stays home
    pg.evaluate("location.hash='home'"); pg.wait_for_timeout(500)
    bb=pg.locator('.stage .pip').bounding_box(); cx=bb['x']+bb['width']/2; cy=bb['y']+bb['height']/2
    tp('touchStart',cx,cy); pg.wait_for_timeout(60); tp('touchEnd',0,0); pg.wait_for_timeout(300)
    print('tap stays home:',pg.evaluate('location.hash'), pg.inner_text('.pipline'))
    # tiny pull springs back
    tp('touchStart',cx,cy); pg.wait_for_timeout(300); tp('touchMove',cx+10,cy+8); tp('touchEnd',0,0); pg.wait_for_timeout(600)
    print('tiny pull hash:',pg.evaluate('location.hash'),'transform:',pg.evaluate("document.querySelector('.stage .pip').style.transform"))
    # tap quadrant
    pg.tap('.q-play'); pg.wait_for_timeout(400); print('tap quad:',pg.evaluate('location.hash'))
    pg.evaluate("location.hash='home'"); pg.wait_for_timeout(300)
    # asleep after idle? skip. test a heavy mood palette difference
    b.close()
print(errs or 'ok')
