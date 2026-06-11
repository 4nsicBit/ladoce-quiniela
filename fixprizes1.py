import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix 1: DEFAULT_STATE - cambiar distribution por prizes (montos fijos)
old1 = '    grupos:{entryFee:100,distribution:[100]},r32:{entryFee:100,distribution:[100]},\n    r16:{entryFee:100,distribution:[100]},cuartos:{entryFee:150,distribution:[70,30]},\n    semis:{entryFee:200,distribution:[70,30]},final:{entryFee:300,distribution:[100]},\n    torneo:{entryFee:500,distribution:[50,30,20]},'
new1 = '    grupos:{entryFee:100,prizes:[1000,500,0]},r32:{entryFee:100,prizes:[1000,500,0]},\n    r16:{entryFee:100,prizes:[1000,500,0]},cuartos:{entryFee:150,prizes:[1500,750,0]},\n    semis:{entryFee:200,prizes:[2000,1000,0]},final:{entryFee:300,prizes:[3000,0,0]},\n    torneo:{entryFee:500,prizes:[5000,2500,1000]},'
print("Fix1 DEFAULT:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix 2: calcular dist/pot en leaderboard usando prizes
old2 = '    const board=boards[k]||[]; const pot=pots[k]||0; const dist=state.pools[k]?.distribution||[100];'
new2 = '    const board=boards[k]||[]; const pot=pots[k]||0; const prizes=state.pools[k]?.prizes||[0,0,0]; const bolsa=Math.max(0,pot-prizes.reduce((a,b)=>a+b,0));'
print("Fix2 leaderboard1:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

old3 = '    const board=boards[phase]||[]; const pool=state.pools[phase]; const pot=pots[phase]||0; const dist=pool?.distribution||[100];'
new3 = '    const board=boards[phase]||[]; const pool=state.pools[phase]; const pot=pots[phase]||0; const prizes=pool?.prizes||[0,0,0]; const bolsa=Math.max(0,pot-prizes.reduce((a,b)=>a+b,0));'
print("Fix3 leaderboard2:", "OK" if old3 in content else "NO ENCONTRADO")
content = content.replace(old3, new3)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
