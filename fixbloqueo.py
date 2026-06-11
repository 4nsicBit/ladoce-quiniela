import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '        {/* Datos */}\n        <section>'

new = '''        {/* Bloqueo de partidos */}
        <section style={{marginBottom:"2rem"}}>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>
            Cerrar pronosticos por partido
          </div>
          <div style={{display:"grid",gap:5}}>
            {state.matches
              .filter(m=>m.home&&m.away)
              .sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff))
              .slice(0,20)
              .map(m=>{
                const st=matchStatus(m.kickoff);
                const stColor=st==="live"?"var(--amber)":st==="finished"?"var(--green)":"var(--tx3)";
                const stLabel=st==="live"?"En vivo":st==="finished"?"Terminado":"Pendiente";
                return(
                  <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"center",padding:"9px 12px",background:m.locked?"rgba(91,184,168,0.05)":"var(--bg2)",border:`0.5px solid ${m.locked?"var(--bdr)":"var(--bdr2)"}`,borderRadius:"var(--r)"}}>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:500,color:"var(--tx)"}}>{m.home} vs {m.away}</div>
                      <div style={{fontSize:"9px",color:"var(--tx3)",marginTop:2}}>{fmtD(m.kickoff,lang)} · <span style={{color:stColor}}>{stLabel}</span></div>
                    </div>
                    <div style={{fontSize:"10px",color:m.locked?"var(--teal)":"var(--tx3)",fontWeight:m.locked?500:400}}>
                      {m.locked?"Cerrado":"Abierto"}
                    </div>
                    <button
                      onClick={()=>toggleLock(m.id)}
                      style={{
                        padding:"5px 10px",fontSize:"11px",
                        background:m.locked?"transparent":"rgba(217,95,95,0.1)",
                        borderColor:m.locked?"var(--bdr)":"var(--red)",
                        color:m.locked?"var(--teal)":"var(--red)",
                      }}
                    >
                      {m.locked?<><Unlock size={11}/> Abrir</>:<><Lock size={11}/> Cerrar</>}
                    </button>
                  </div>
                );
              })
            }
          </div>
        </section>

        {/* Datos */}
        <section>'''

print("Fix bloqueo admin:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
