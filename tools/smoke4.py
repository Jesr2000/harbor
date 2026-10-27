import re, sys, json, time
from playwright.sync_api import sync_playwright
D='/tmp/claude-0/-home-claude/e56a7f90-54ed-5347-9f81-d7064a06fb18/scratchpad/'
errs=[]
def run(fn, dark=False, w=390, h=800):
    with sync_playwright() as p:
        b=p.chromium.launch(args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])
        ctx=b.new_context(viewport={'width':w,'height':h},color_scheme='dark' if dark else 'light')
        pg=ctx.new_page()
        pg.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        pg.goto('file://'+D+'smoke_page.html')
        fn(pg)
        b.close()
def txt(pg,n=90): return pg.inner_text('#app')[:n].replace('\n',' | ')
def overflow(pg):
    return pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth+1")
def t2(pg):
    pg.evaluate("localStorage.setItem('harbor.v1',JSON.stringify({v:3,intro:true}))")
    pg.reload(); pg.wait_for_timeout(500)
    pg.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important}')
    def go(r): pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(250)
    # checkin
    go('checkin'); pg.click('#mood2'); pg.fill('#noteInput','long day'); pg.click('text=Save check-in'); pg.wait_for_timeout(300)
    print('checkin:',txt(pg,50), '| bg', pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg')"))
    pg.screenshot(path=D+'v3_checkin.png')
    # letgo
    go('letgo'); pg.fill('#worryText','my exam'); pg.click('text=Tie it to a balloon'); pg.wait_for_timeout(300)
    bb=pg.locator('.balloon').bounding_box(); cx=bb['x']+bb['width']/2; cy=bb['y']+60
    pg.mouse.move(cx,cy); pg.mouse.down(); pg.mouse.move(cx,cy+60,steps=5); pg.mouse.up(); pg.wait_for_timeout(4500)
    print('letgo:', pg.inner_text('#app')[-200:].replace('\n',' | '))
    go('tide'); print('tide:',txt(pg,80))
    # calm
    go('calm'); print('calm:',txt(pg,80))
    go('sounds'); pg.click('text=Cosy fire'); pg.wait_for_timeout(600)
    print('sound pill visible:',pg.is_visible('#btnSound'))
    for lid in ['ocean','rain','wind','fire','night','chimes','bowl','pad']:
        pass
    pg.click('text=Stop all sound'); pg.wait_for_timeout(300)
    go('scenes'); 
    for i in range(3):
        pg.click(f'.scene-btn >> nth={i}'); pg.wait_for_timeout(1800)
        if i==0:
            pg.screenshot(path=D+'v3_scene.png'); print('scene line:',pg.inner_text('.scene-line'))
            pg.click('.scene-bar >> text=Eyes closed'); pg.wait_for_timeout(300); pg.click('.scene-dark')
        pg.click('.scene-x'); pg.wait_for_timeout(200)
    pg.click('text=Stop all sound') if False else None
    go('breathe'); pg.click('text=Start'); pg.wait_for_timeout(2600)
    print('breathe label:',pg.inner_text('.bcenter').replace('\n',' | '), pg.evaluate("document.querySelector('.bcircle').style.transform"))
    pg.screenshot(path=D+'v3_breathe.png')
    pg.wait_for_timeout(2500)
    print('breathe label2:',pg.inner_text('.bcenter').replace('\n',' | '), pg.evaluate("document.querySelector('.bcircle').style.transform"))
    pg.click('text=Pause'); pg.wait_for_timeout(300); l=pg.inner_text('.bcenter'); pg.wait_for_timeout(800)
    print('paused same:', l==pg.inner_text('.bcenter'), l.replace('\n',' '))
    pg.click('text=Continue'); pg.wait_for_timeout(500); pg.click('text=Stop'); print('breathe stopped:', pg.is_visible('text=Rhythm'))
    pg.click('text=Box'); pg.click('text=Start'); pg.wait_for_timeout(2500)
    go('guided'); pg.click('text=Begin >> nth=0'); pg.wait_for_timeout(300); pg.click('text=Stop >> nth=0')
    pg.click('text=Begin >> nth=1'); 
    for n in range(5):
        k=pg.locator('.chip[aria-pressed]').count()
        for i in range(k): pg.locator('.chip[aria-pressed]').nth(i).click()
        pg.click('text=Next') if n<4 else pg.click('text=Finish'); pg.wait_for_timeout(150)
    print('guided end:', 'You are here' in pg.inner_text('#app'))
    pg.click('text=Kind words >> nth=1') if pg.locator('text=Kind words').count()>1 else None
    # play
    go('play'); print('play:',txt(pg,60))
    go('bubbles'); pg.wait_for_timeout(1500); print('bubbles:',pg.locator('.bubble').count())
    pg.locator('.bubble').first.click(force=True); pg.wait_for_timeout(200); print('count',pg.inner_text('.bigcount'))
    go('sheep'); pg.wait_for_timeout(2600); print('sheep:',pg.locator('.sheep').count()); pg.screenshot(path=D+'v3_sheep.png')
    pg.locator('.sheep').first.click(force=True); print('sheep count:',pg.inner_text('.bigcount'))
    go('harp'); hb=pg.locator('.harp').bounding_box()
    pg.mouse.move(hb['x']+5,hb['y']+100); pg.mouse.down(); pg.mouse.move(hb['x']+hb['width']-5,hb['y']+100,steps=20); pg.mouse.up()
    print('harp sparks seen:', pg.locator('.hstring').count()); pg.screenshot(path=D+'v3_harp.png')
    pg.click('text=Let Pip play'); pg.wait_for_timeout(1500); pg.click('text=Stop Pip')
    go('wardrobe'); pg.click('.hatbtn >> nth=1'); pg.wait_for_timeout(200); pg.screenshot(path=D+'v3_wardrobe.png'); pg.click('text=Make Pip dance')
    go('silly')
    for t in ['Tell me a joke','Silly dare','Compliment cannon',"Pip's forecast",'Fun fact']: pg.click('text='+t)
    pg.click('text=Rename a worry'); pg.fill('#worryInput','exam'); pg.click('text=Give it a silly name')
    pg.click('text=Spin the wheel'); pg.click('.btn.popbtn >> text=Spin'); pg.wait_for_timeout(500)
    # grow
    go('grow'); go('step'); pg.click('text=Some'); pg.click('text=Done'); pg.wait_for_timeout(200); print('step:',txt(pg,60))
    go('jar'); pg.fill('#jarInput','I tried'); pg.click('text=Add to jar'); pg.wait_for_timeout(200); pg.click('text=Open the jar'); print('jar:',txt(pg,60))
    go('garden'); pg.click('text=Plant it'); pg.wait_for_timeout(200); pg.click('.pot'); pg.wait_for_timeout(900); print('garden:',pg.inner_text('.pot').replace('\n',' | ')); pg.screenshot(path=D+'v3_garden.png')
    go('someday'); pg.fill('input[aria-label="New wish"]','Swim in the sea'); pg.click('text=Add >> nth=0'); pg.wait_for_timeout(200)
    pg.click('.pc-card >> nth=0'); pg.wait_for_timeout(250); print('place:',txt(pg,50)); pg.screenshot(path=D+'v3_place.png')
    pg.click('.check >> nth=0'); pg.wait_for_timeout(200); pg.click('text=I went here')
    print('back label on place:',pg.inner_text('#backLabel'),pg.is_visible('#btnHome'))
    go('settings'); print('settings:',txt(pg,60)); pg.screenshot(path=D+'v3_settings.png')
    pg.click('text=Lift me a little'); pg.click('text=Keep it soft'); pg.click('text=Match my mood')
    go('help'); print('help:',txt(pg,40), pg.inner_text('#backLabel'))
    for r in ['home','feel','calm','play','grow','nonsense']:
        go(r); print(r,'overflow:',overflow(pg),'|',txt(pg,30))
run(t2)
print('\n'.join(errs) or 'NO ERRORS')
