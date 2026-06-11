import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = 'function SessionTimer({ participantId }) {'

new = '''function Predictions({ pid, setPid, phase, setPhase, participants, predictions, matches, config, setPred, urlParticipant, t, lang }) {
  if(!pid) return(
    <div className="fade" style={{padding:"1.5rem 1rem"}}>
      <div style={{fontFamily:"var(--fd)",fontSize:"24px",fontWeight:500,marginBottom:6}}>{t.pred.whoAreYou}</div>
      <div style={{fontSize:"13px",color:"var(--tx3)",marginBottom:"1.5rem"}}>{t.pred.selectName}</div>
      {participants.length===0
        ? <div style={{color:"var(--tx3)",fontSize:"13px"}}>{t.pred.noParticipants}</div>
        : <div style={{display:"grid",gap:6}}>{participants.map(p=>(
            <button key={p.id} onClick={()=>setPid(p.id)} style={{padding:"13px 16px",justifyContent:"flex-start",fontSize:"15px",color:"var(--tx)",fontFamily:"var(--fd)",letterSpacing:".02em"}}>{p.name}</button>
          ))}</div>
      }
    </div>
  );
  const part = participants.find(p=>p.id===pid);
  const up = predictions[pid]||{};
  const ms = matches.filter(m=>m.phase===phase).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));
  return(
    <div className="fade">
      <div style={{padding:"1rem 1rem 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontFamily:"var(--fd)",fontSize:"19px",fontWeight:500}}>{part?.name}</div>
          <div style={{fontSize:"11px",color:"var(--tx3)"}}>Mundial 2026</div>
        </div>
        {!urlParticipant&&<button className="ghost" onClick={()=>setPid(null)}>{t.pred.change}</button>}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",padding:"0 1rem .9rem",scrollbarWidth:"none"}}>
        {PHASES.map(({key})=>(
          <button key={key} onClick={()=>setPhase(key)} className={`ptab${phase===key?" on":""}`}>
            {t.phases[key]} {part?.payments[key]?"✓":""}
          </button>
        ))}
      </div>
      {!part?.payments[phase]&&(
        <div style={{margin:"0 1rem .9rem",padding:"9px 13px",background:"var(--amber-d)",borderRadius:"var(--r)",fontSize:"12px",color:"var(--amber)"}}>{t.pred.notPaid}</div>
      )}
      <div style={{padding:"0 1rem 1.5rem",display:"grid",gap:4}}>
        {ms.map(m=>{
          const pr=up[m.id]||{home:"",away:""};
          return(
            <div key={m.id} className={`mrow${m.locked?" lk":""}`}>
              <div>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{m.group?`G-${m.group}`:m.id}</div>
                <div style={{fontSize:"9px",color:"var(--tx3)",marginTop:2}}>{fmtD(m.kickoff,lang)}</div>
              </div>
              <div style={{fontSize:"12px",textAlign:"right"}}>{m.home||"—"}</div>
              <div style={{display:"flex",gap:3,alignItems:"center",justifyContent:"center"}}>
                <PredInput matchId={m.id} field="home" initialValue={pr.home} disabled={m.locked||!m.home} onSave={v=>setPred(pid,m.id,"home",v)}/>
                <span style={{color:"var(--tx3)",fontSize:"11px"}}>–</span>
                <PredInput matchId={m.id} field="away" initialValue={pr.away} disabled={m.locked||!m.away} onSave={v=>setPred(pid,m.id,"away",v)}/>
              </div>
              <div style={{fontSize:"12px"}}>{m.away||"—"}</div>
              <div>{m.locked?<Lock size={11} style={{color:"var(--teal)",opacity:.7}}/>:<Unlock size={11} style={{color:"var(--tx3)",opacity:.2}}/>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessionTimer({ participantId }) {'''

print("Predictions externo:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
