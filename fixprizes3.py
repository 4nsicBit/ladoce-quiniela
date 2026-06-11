import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix 9: configuracion de pozos en Admin - reemplazar distribution por prizes
old9 = '                    <div>\n                      <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{t.admin.distribution}</div>\n                      <input type="text" key={`dist-${key}`} defaultValue={pool.distribution.join(",")} onBlur={e=>updPool(key,"distribution",e.target.value.split(",").map(x=>parseFloat(x)||0))}/>\n                    </div>'
new9 = '                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>\n                      {["1\xb0","2\xb0","3\xb0"].map((pos,i)=>(\n                        <div key={i}>\n                          <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{pos} lugar</div>\n                          <input type="number" min="0"\n                            key={`prize-${key}-${i}`}\n                            defaultValue={pool.prizes?.[i]||0}\n                            onBlur={e=>{\n                              const newPrizes=[...(pool.prizes||[0,0,0])];\n                              newPrizes[i]=parseInt(e.target.value)||0;\n                              updPool(key,"prizes",newPrizes);\n                            }}\n                          />\n                        </div>\n                      ))}\n                    </div>'
print("Fix9 admin config:", "OK" if old9 in content else "NO ENCONTRADO")
content = content.replace(old9, new9)

# Fix 10: quitar validacion de suma=100 que ya no aplica
old10 = '                  {sum!==100&&<div style={{marginTop:5,fontSize:"10px",color:"var(--amber)"}}>{t.admin.sumWarning}</div>}'
new10 = '                  {(()=>{ const total=(pool.prizes||[]).reduce((a,b)=>a+b,0); const p=pots[key]||0; return total>p&&p>0?<div style={{marginTop:5,fontSize:"10px",color:"var(--amber)"}}>⚠ Premios ({mxn(total)}) superan el pozo ({mxn(p)})</div>:null; })()}'
print("Fix10 validacion:", "OK" if old10 in content else "NO ENCONTRADO")
content = content.replace(old10, new10)

# Fix 11: quitar calculo de sum que ya no aplica
old11 = '              const pool=state.pools[key]; const sum=pool.distribution.reduce((a,b)=>a+b,0);'
new11 = '              const pool=state.pools[key];'
print("Fix11 sum:", "OK" if old11 in content else "NO ENCONTRADO")
content = content.replace(old11, new11)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
