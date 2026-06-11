import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '''    const myPoints = part ? (boards[urlParticipant]||[]).find ? (() => {
      let pts=0;
      state.matches.forEach(m=>{
        const pred=(state.predictions[urlParticipant]||{})[m.id];
        if(pred) pts+=calcPts(pred,m,state.config);
      });
      return pts;
    })() : 0 : 0;'''

new = '''    const myPoints = part ? (() => {
      let total=0;
      state.matches.forEach(m=>{
        const pred=(state.predictions[urlParticipant]||{})[m.id];
        if(pred) total+=pts(pred,m,state.config);
      });
      return total;
    })() : 0;'''

print("Fix myPoints:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
