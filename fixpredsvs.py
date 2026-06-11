import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix 1: agregar seccion mis pronosticos vs resultado antes del footer
old1 = '        <div style={{textAlign:"center",padding:"16px 10px 8px",borderTop:"0.5px solid rgba(91,184,168,0.08)",marginTop:"1rem"}}>'
new1 = '''        {urlParticipant&&state.matches.some(m=>m.homeScore!==null)&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Mis pronosticos vs resultado</div>
            <div style={{display:"grid",gap:4}}>
              {state.matches
                .filter(m=>m.homeScore!==null&&m.home&&m.away)
                .sort((a,b)=>new Date(b.kickoff)-new Date(a.kickoff))
                .slice(0,10)
                .map(m=>{
                  const pred=(state.predictions[urlParticipant]||{})[m.id];
                  const myPts=pred?pts(pred,m,state.config):0;
                  const correct=myPts>=state.config.pointsExact*(m.phase==="grupos"?1:state.config.knockoutMultiplier);
                  const partial=myPts>0&&!correct;
                  const bg=correct?"rgba(82,196,138,0.06)":partial?"rgba(245,158,11,0.06)":"rgba(217,95,95,0.04)";
                  const borderC=correct?"var(--green)":partial?"var(--amber)":"rgba(217,95,95,0.3)";
                  return(
                    <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"center",padding:"9px 12px",background:bg,border:`0.5px solid ${borderC}`,borderRadius:"var(--r)"}}>
                      <div>
                        <div style={{fontSize:"12px",fontWeight:500}}>{m.home} vs {m.away}</div>
                        <div style={{fontSize:"10px",color:"var(--tx3)",marginTop:2}}>
                          Real: <span style={{color:"var(--tx)",fontWeight:500}}>{m.homeScore}-{m.awayScore}</span>
                          {pred&&<span> · Tu: <span style={{color:"var(--tx)",fontWeight:500}}>{pred.home}-{pred.away}</span></span>}
                          {!pred&&<span style={{color:"var(--tx3)"}}> · Sin pronostico</span>}
                        </div>
                      </div>
                      <div style={{fontSize:"13px",fontWeight:500,color:correct?"var(--green)":partial?"var(--amber)":"var(--red)",textAlign:"right"}}>
                        {myPts>0?"+"+myPts:"0"}<span style={{fontSize:"9px"}}> pts</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        <div style={{textAlign:"center",padding:"16px 10px 8px",borderTop:"0.5px solid rgba(91,184,168,0.08)",marginTop:"1rem"}}>'''

print("Fix mis pronosticos:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix 2: notificacion 1 hora antes en MatchCard - agregar badge de urgencia
old2 = '              <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:"9px",background:st.bg,color:st.color}}>\n                {st.dot&&<span style={{width:4,height:4,borderRadius:"50%",background:st.color,display:"inline-block",animation:"pulse 1.5s infinite"}}/>}\n                {st.label}\n              </span>'
new2 = '''              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {diff>0&&diff<3600000&&(
                  <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:"9px",background:"rgba(217,95,95,0.15)",color:"var(--red)",fontWeight:500}}>
                    Cierra pronto
                  </span>
                )}
                <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:"9px",background:st.bg,color:st.color}}>
                  {st.dot&&<span style={{width:4,height:4,borderRadius:"50%",background:st.color,display:"inline-block",animation:"pulse 1.5s infinite"}}/>}
                  {st.label}
                </span>
              </div>'''

print("Fix notif 1hora:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
