import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix 4: pot card - mostrar premios fijos + bolsa
old4 = '          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>\n            {dist.map((pct,i)=>(\n              <div key={i} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"6px 13px"}}>\n                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{i+1}\xb0</div>\n                <div style={{fontSize:"13px",fontWeight:500,color:"var(--sand-l)"}}>{mxn(pot*pct/100)}</div>\n              </div>\n            ))}\n          </div>'
new4 = '          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>\n            {prizes.map((p,i)=>p>0&&(\n              <div key={i} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"6px 13px"}}>\n                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{i+1}\xb0</div>\n                <div style={{fontSize:"13px",fontWeight:500,color:"var(--sand-l)"}}>{mxn(p)}</div>\n              </div>\n            ))}\n            {bolsa>0&&(\n              <div style={{background:"rgba(91,184,168,0.08)",borderRadius:"var(--r)",padding:"6px 13px",border:"0.5px solid var(--bdr)"}}>\n                <div style={{fontSize:"9px",color:"var(--tx3)"}}>Bolsa</div>\n                <div style={{fontSize:"13px",fontWeight:500,color:"var(--teal)"}}>{mxn(bolsa)}</div>\n              </div>\n            )}\n          </div>'
print("Fix4 pot card:", "OK" if old4 in content else "NO ENCONTRADO")
content = content.replace(old4, new4)

# Fix 5: premio en tabla de posiciones - usar prizes en lugar de dist
old5 = '                  {isAdmin&&prize?<span style={{fontSize:"12px",color:"var(--sand)",fontWeight:500,textAlign:"right"}}>{prize}</span>:<span/>}'
new5 = '                  {isAdmin&&prizes[idx]>0?<span style={{fontSize:"12px",color:"var(--sand)",fontWeight:500,textAlign:"right"}}>{mxn(prizes[idx])}</span>:<span/>}'
print("Fix5 premio tabla:", "OK" if old5 in content else "NO ENCONTRADO")
content = content.replace(old5, new5)

# Fix 6: prize variable en board.map - ya no se necesita
old6 = '              const prize=idx<dist.length?mxn(pot*dist[idx]/100):null;'
new6 = '              // prizes se usa directamente'
print("Fix6 prize var:", "OK" if old6 in content else "NO ENCONTRADO")
content = content.replace(old6, new6)

# Fix 7: WhatsApp - usar prizes en lugar de dist
old7 = '    board.forEach((r,i)=>{ const em=["🥇","🥈","🥉"][i]||`${i+1}.`; const pr=i<dist.length?` (${mxn(pot*dist[i]/100)})`:""; msg+=`${em} ${r.name}: ${r.score} pts${pr}\\n`; });'
new7 = '    board.forEach((r,i)=>{ const em=["🥇","🥈","🥉"][i]||`${i+1}.`; const pr=prizes[i]>0?` (${mxn(prizes[i])})`:""; msg+=`${em} ${r.name}: ${r.score} pts${pr}\\n`; });'
print("Fix7 WhatsApp:", "OK" if old7 in content else "NO ENCONTRADO")
content = content.replace(old7, new7)

# Fix 8: shareWA - obtener prizes
old8 = '    const board=boards[k]||[]; const pot=pots[k]||0; const dist=state.pools[k]?.distribution||[100];'
new8 = '    const board=boards[k]||[]; const pot=pots[k]||0; const prizes=state.pools[k]?.prizes||[0,0,0];'
print("Fix8 shareWA:", "OK" if old8 in content else "NO ENCONTRADO")
content = content.replace(old8, new8)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
