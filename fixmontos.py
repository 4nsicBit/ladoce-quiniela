import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix 1: ocultar pot card completo para no-admin
old1 = '        {/* Pot card */}\n        <div className="card card-sand" style={{marginBottom:"1rem"}}>\n          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>\n            <div>\n              <div style={{fontSize:"10px",color:"var(--tx3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{t.lb.pot}</div>\n              <div style={{fontFamily:"var(--fd)",fontSize:"clamp(24px,5vw,32px)",fontWeight:500,color:"var(--sand)",lineHeight:1.05}}>{mxn(pot)}</div>\n            </div>\n            <button className="sand" onClick={()=>shareWA(phase)} style={{fontSize:"12px"}}><Share2 size={12}/> WhatsApp</button>\n          </div>\n          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>\n            {dist.map((pct,i)=>(\n              <div key={i} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"6px 13px"}}>\n                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{i+1}\xb0</div>\n                <div style={{fontSize:"13px",fontWeight:500,color:"var(--sand-l)"}}>{mxn(pot*pct/100)}</div>\n              </div>\n            ))}\n          </div>\n        </div>'

new1 = '        {/* Pot card - solo admin */}\n        {isAdmin&&(\n        <div className="card card-sand" style={{marginBottom:"1rem"}}>\n          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>\n            <div>\n              <div style={{fontSize:"10px",color:"var(--tx3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{t.lb.pot}</div>\n              <div style={{fontFamily:"var(--fd)",fontSize:"clamp(24px,5vw,32px)",fontWeight:500,color:"var(--sand)",lineHeight:1.05}}>{mxn(pot)}</div>\n            </div>\n            <button className="sand" onClick={()=>shareWA(phase)} style={{fontSize:"12px"}}><Share2 size={12}/> WhatsApp</button>\n          </div>\n          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>\n            {dist.map((pct,i)=>(\n              <div key={i} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"6px 13px"}}>\n                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{i+1}\xb0</div>\n                <div style={{fontSize:"13px",fontWeight:500,color:"var(--sand-l)"}}>{mxn(pot*pct/100)}</div>\n              </div>\n            ))}\n          </div>\n        </div>\n        )}'

print("Fix1 pot card:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix 2: ocultar premio en tabla de posiciones para no-admin
old2 = '                  {prize?<span style={{fontSize:"12px",color:"var(--sand)",fontWeight:500,textAlign:"right"}}>{prize}</span>:<span/>}'
new2 = '                  {isAdmin&&prize?<span style={{fontSize:"12px",color:"var(--sand)",fontWeight:500,textAlign:"right"}}>{prize}</span>:<span/>}'
print("Fix2 prize:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
