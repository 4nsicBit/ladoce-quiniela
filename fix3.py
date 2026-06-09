content = open('pages/index.js', encoding='utf-8').read()
old = 'const ms=k==="torneo"?state.matches:state.matches.filter(m=>m.phase===k);'
new_val = 'const ms=k==="torneo"?state.matches.sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff)):state.matches.filter(m=>m.phase===k).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));'
print('Patch 3:', 'OK' if old in content else 'NO ENCONTRADO')
open('pages/index.js', 'w', encoding='utf-8').write(content.replace(old, new_val))
