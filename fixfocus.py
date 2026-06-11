import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Quitar key de los PredInput para que React no los recree
old1 = '                  <PredInput key={`ph-${m.id}`} matchId={m.id} field="home" initialValue={pr.home} disabled={m.locked||!m.home} onSave={v=>setPred(pid,m.id,"home",v)}/>'
new1 = '                  <PredInput matchId={m.id} field="home" initialValue={pr.home} disabled={m.locked||!m.home} onSave={v=>setPred(pid,m.id,"home",v)}/>'
print("Fix key home:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

old2 = '                  <PredInput key={`pa-${m.id}`} matchId={m.id} field="away" initialValue={pr.away} disabled={m.locked||!m.away} onSave={v=>setPred(pid,m.id,"away",v)}/>'
new2 = '                  <PredInput matchId={m.id} field="away" initialValue={pr.away} disabled={m.locked||!m.away} onSave={v=>setPred(pid,m.id,"away",v)}/>'
print("Fix key away:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

# Mejorar el useEffect del PredInput para no actualizar si tiene foco
old3 = '  useEffect(()=>{\n    if(document.activeElement !== inputRef.current){\n      setVal(initialValue || "");\n    }\n  },[initialValue]);'
new3 = '  useEffect(()=>{\n    if(inputRef.current && document.activeElement === inputRef.current) return;\n    if(initialValue !== undefined && initialValue !== null && initialValue !== "")\n      setVal(String(initialValue));\n  },[initialValue]);'
print("Fix useEffect:", "OK" if old3 in content else "NO ENCONTRADO")
content = content.replace(old3, new3)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
