import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix 1: cambiar bloqueo de 5 a 30 minutos antes del kickoff
old1 = '    setState(p=>({...p,matches:p.matches.map(m=>(!m.locked&&new Date(m.kickoff).getTime()-5*60*1000<=now)?{...m,locked:true}:m)}));'
new1 = '    setState(p=>({...p,matches:p.matches.map(m=>(!m.locked&&new Date(m.kickoff).getTime()-30*60*1000<=now)?{...m,locked:true}:m)}));'
print("Fix bloqueo 30min:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

open("pages/index.js", "w", encoding="utf-8").write(content)
