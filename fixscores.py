import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix homeScore en resultados
old1 = '                  <input type="number" min="0" max="20" className="si" value={m.homeScore??""} disabled={!isAdmin} onChange={e=>updM(m.id,"homeScore",e.target.value===""?null:parseInt(e.target.value))} style={{width:38}}/>'
new1 = '                  <input type="number" min="0" max="20" className="si" key={`hs-${m.id}`} defaultValue={m.homeScore??""} disabled={!isAdmin} onBlur={e=>updM(m.id,"homeScore",e.target.value===""?null:parseInt(e.target.value))} style={{width:38}}/>'
print("Fix homeScore:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix awayScore en resultados
old2 = '                  <input type="number" min="0" max="20" className="si" value={m.awayScore??""} disabled={!isAdmin} onChange={e=>updM(m.id,"awayScore",e.target.value===""?null:parseInt(e.target.value))} style={{width:38}}/>'
new2 = '                  <input type="number" min="0" max="20" className="si" key={`as-${m.id}`} defaultValue={m.awayScore??""} disabled={!isAdmin} onBlur={e=>updM(m.id,"awayScore",e.target.value===""?null:parseInt(e.target.value))} style={{width:38}}/>'
print("Fix awayScore:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

# Fix pronostico home
old3 = '                  <input type="number" min="0" max="20" className="si" value={pr.home} disabled={m.locked||!m.home} onChange={e=>setPred(pid,m.id,"home",e.target.value)} style={{width:38}}/>'
new3 = '                  <input type="number" min="0" max="20" className="si" key={`ph-${m.id}`} defaultValue={pr.home} disabled={m.locked||!m.home} onBlur={e=>setPred(pid,m.id,"home",e.target.value)} style={{width:38}}/>'
print("Fix pred home:", "OK" if old3 in content else "NO ENCONTRADO")
content = content.replace(old3, new3)

# Fix pronostico away
old4 = '                  <input type="number" min="0" max="20" className="si" value={pr.away} disabled={m.locked||!m.away} onChange={e=>setPred(pid,m.id,"away",e.target.value)} style={{width:38}}/>'
new4 = '                  <input type="number" min="0" max="20" className="si" key={`pa-${m.id}`} defaultValue={pr.away} disabled={m.locked||!m.away} onBlur={e=>setPred(pid,m.id,"away",e.target.value)} style={{width:38}}/>'
print("Fix pred away:", "OK" if old4 in content else "NO ENCONTRADO")
content = content.replace(old4, new4)

open("pages/index.js", "w", encoding="utf-8").write(content)
