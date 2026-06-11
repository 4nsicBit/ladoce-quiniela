import sys
sys.stdout.reconfigure(encoding="utf-8")

with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Encontrar inicio y fin del componente Home
start_marker = "  // ── HOME ──────────────────────────────────────────────────"
end_marker = "  // ── PREDICTIONS ───────────────────────────────────────────"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print("NO ENCONTRADO: inicio Home")
    sys.exit(1)
if end_idx == -1:
    print("NO ENCONTRADO: fin Home")
    sys.exit(1)

print("Inicio Home: linea ~" + str(content[:start_idx].count("\n")+1))
print("Fin Home: linea ~" + str(content[:end_idx].count("\n")+1))

new_home = """  // ── HOME DASHBOARD ──────────────────────────────────────────
  const Home=()=>{
    const now = Date.now();
    const part = urlParticipant ? state.participants.find(p=>p.id===urlParticipant) : null;

    // Proximos partidos (pendientes, ordenados por fecha)
    const upcoming = state.matches
      .filter(m=>m.home&&m.away&&new Date(m.kickoff).getTime()>now-7200000)
      .sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));

    const next2 = upcoming.slice(0,2);
    const next4 = upcoming.slice(0,4);

    // Partidos en vivo
    const live = state.matches.filter(m=>{
      const k=new Date(m.kickoff).getTime();
      return now>=k && now<=k+7200000 && m.home && m.away;
    });

    // Puntos del participante actual
    const myPoints = part ? (boards[urlParticipant]||[]).find ? (() => {
      let pts=0;
      state.matches.forEach(m=>{
        const pred=(state.predictions[urlParticipant]||{})[m.id];
        if(pred) pts+=calcPts(pred,m,state.config);
      });
      return pts;
    })() : 0 : 0;

    // Pronosticos pendientes del participante
    const pendingPreds = part ? state.matches.filter(m=>{
      const k=new Date(m.kickoff).getTime();
      const pred=(state.predictions[urlParticipant]||{})[m.id];
      return m.home && m.away && k>now && (!pred||pred.home===""||pred.away==="");
    }).length : 0;

    // Cuenta regresiva
    const countdown=(iso)=>{
      const diff=new Date(iso).getTime()-now;
      if(diff<=0) return "En curso";
      const h=Math.floor(diff/3600000);
      const m=Math.floor((diff%3600000)/60000);
      if(h>48) return Math.floor(h/24)+"d "+h%24+"h";
      if(h>0) return h+"h "+m+"m";
      return m+"m";
    };

    const stBadge=(m)=>{
      const k=new Date(m.kickoff).getTime();
      if(now>=k&&now<=k+7200000) return {label:"En vivo",bg:"var(--amber-d)",color:"var(--amber)",dot:true};
      if(m.homeScore!==null) return {label:"Terminado",bg:"var(--green-d)",color:"var(--green)",dot:false};
      return {label:fmtD(m.kickoff,lang),bg:"var(--bg4)",color:"var(--tx3)",dot:false};
    };

    return (
    <div className="fade">
      {/* Hero */}
      <div className="hero-bg" style={{textAlign:"center",padding:"2rem 1rem 1.5rem"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
          <LogoMark size={44}/>
        </div>
        <div style={{fontFamily:"var(--fd)",fontSize:"clamp(11px,3vw,13px)",color:"var(--teal)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:4}}>La Doce · Social.Roof.Bar</div>
        <div style={{fontFamily:"var(--fd)",fontSize:"clamp(22px,6vw,34px)",fontWeight:500,lineHeight:1.15,marginBottom:6}}>
          <span style={{color:"var(--tx)"}}>Quiniela </span>
          <span style={{color:"var(--sand)"}}>Mundial 2026</span>
        </div>
        <div style={{fontSize:"11px",color:"var(--tx3)",letterSpacing:".04em"}}>{t.home.subtitle}</div>
      </div>

      <div style={{padding:"1.2rem 1rem"}}>

        {/* Card participante */}
        {part&&(
          <div style={{background:"linear-gradient(135deg,rgba(91,184,168,0.08),rgba(200,169,106,0.06))",border:"0.5px solid var(--bdr)",borderRadius:"var(--rl)",padding:"1rem 1.2rem",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:"10px",color:"var(--tx3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:2}}>Bienvenido</div>
              <div style={{fontFamily:"var(--fd)",fontSize:"20px",fontWeight:500,color:"var(--tx)"}}>{part.name}</div>
            </div>
            <div style={{display:"flex",gap:12}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"22px",fontWeight:500,color:"var(--teal)"}}>{myPoints}</div>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>pts</div>
              </div>
              {pendingPreds>0&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"22px",fontWeight:500,color:"var(--sand)"}}>{pendingPreds}</div>
                  <div style={{fontSize:"9px",color:"var(--tx3)"}}>pendientes</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Partidos en vivo */}
        {live.length>0&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--amber)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--amber)",display:"inline-block",animation:"pulse 1.5s infinite"}}/>
              En vivo ahora
            </div>
            {live.map(m=>(
              <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",padding:"12px 14px",background:"rgba(245,158,11,0.06)",border:"0.5px solid rgba(245,158,11,0.25)",borderRadius:"var(--r)",marginBottom:5}}>
                <div style={{fontSize:"13px",textAlign:"right",fontWeight:500}}>{m.home}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:"20px",fontWeight:700,color:"var(--tx)",minWidth:24,textAlign:"center"}}>{m.homeScore??"-"}</span>
                  <span style={{fontSize:"12px",color:"var(--tx3)"}}>:</span>
                  <span style={{fontSize:"20px",fontWeight:700,color:"var(--tx)",minWidth:24,textAlign:"center"}}>{m.awayScore??"-"}</span>
                </div>
                <div style={{fontSize:"13px",fontWeight:500}}>{m.away}</div>
              </div>
            ))}
          </div>
        )}

        {/* Proximos 2 partidos destacados */}
        {next2.length>0&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Proximos partidos</div>
            {next2.map(m=>{
              const st=stBadge(m);
              const diff=new Date(m.kickoff).getTime()-now;
              const urgent=diff<3600000&&diff>0;
              return(
                <div key={m.id} style={{padding:"12px 14px",background:urgent?"rgba(200,169,106,0.06)":"var(--bg2)",border:`0.5px solid ${urgent?"var(--bdrS)":"var(--bdr2)"}`,borderRadius:"var(--r)",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:"9px",color:"var(--tx3)"}}>{m.group?"Grupo "+m.group:m.phase.toUpperCase()}</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:"9px",background:st.bg,color:st.color}}>
                      {st.dot&&<span style={{width:4,height:4,borderRadius:"50%",background:st.color,display:"inline-block"}}/>}
                      {st.label}
                    </span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
                    <div style={{fontSize:"14px",fontWeight:500,textAlign:"right"}}>{m.home}</div>
                    <div style={{fontSize:"11px",color:"var(--tx3)",textAlign:"center",minWidth:40}}>
                      {diff>0?countdown(m.kickoff):"vs"}
                    </div>
                    <div style={{fontSize:"14px",fontWeight:500}}>{m.away}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista proximos 4 partidos */}
        {next4.length>2&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Agenda</div>
            {next4.slice(2).map(m=>{
              const st=stBadge(m);
              return(
                <div key={m.id} style={{display:"grid",gridTemplateColumns:"48px 1fr auto 1fr",gap:6,alignItems:"center",padding:"8px 12px",background:"var(--bg2)",border:"0.5px solid var(--bdr2)",borderRadius:"var(--r)",marginBottom:4}}>
                  <div style={{fontSize:"9px",color:"var(--tx3)"}}>{fmtD(m.kickoff,lang)}</div>
                  <div style={{fontSize:"12px",textAlign:"right"}}>{m.home}</div>
                  <div style={{fontSize:"10px",color:"var(--tx3)",textAlign:"center",padding:"0 4px"}}>vs</div>
                  <div style={{fontSize:"12px"}}>{m.away}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabla de posiciones */}
        {state.matches.some(m=>m.homeScore!==null)&&(
          <div>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Clasificacion general</div>
            <div style={{display:"grid",gap:3}}>
              {(boards["torneo"]||[]).slice(0,10).map((row,idx)=>{
                const cl=["var(--sand)","#B8B8B8","#A07040"][idx]||"var(--tx2)";
                const isMe=row.id===urlParticipant;
                return(
                  <div key={row.id} style={{display:"grid",gridTemplateColumns:"26px 1fr auto auto",gap:8,alignItems:"center",padding:"8px 12px",background:isMe?"rgba(91,184,168,0.07)":idx<3?"rgba(200,169,106,0.04)":"var(--bg2)",border:`0.5px solid ${isMe?"var(--bdr)":idx<3?"var(--bdrS)":"var(--bdr2)"}`,borderRadius:"var(--r)"}}>
                    <span style={{fontSize:"13px",fontWeight:500,color:cl}}>{idx+1}</span>
                    <span style={{fontSize:"13px",fontWeight:isMe?500:400,color:isMe?"var(--teal)":"var(--tx)"}}>{row.name}{isMe?" (tu)":""}</span>
                    <span style={{fontSize:"10px",color:"var(--tx3)"}}>{row.hits} ac.</span>
                    <span style={{fontSize:"13px",fontWeight:500}}>{row.score}<span style={{fontSize:"9px",color:"var(--tx3)"}}> pts</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer ForensicBit */}
        <div style={{textAlign:"center",padding:"16px 10px 8px",borderTop:"0.5px solid rgba(91,184,168,0.08)",marginTop:"1.5rem"}}>
          <div style={{fontSize:"9px",color:"var(--tx3)",letterSpacing:".06em"}}>Desarrollado para La Doce · Social.Roof.Bar</div>
          <div style={{fontSize:"10px",color:"var(--teal)",fontWeight:500,letterSpacing:".04em",marginTop:"2px"}}>Powered by ForensicBit Solutions</div>
        </div>

      </div>
    </div>
    );
  };

"""

content = content[:start_idx] + new_home + content[end_idx:]

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Dashboard OK - lineas: " + str(len(content.split("\n"))))
