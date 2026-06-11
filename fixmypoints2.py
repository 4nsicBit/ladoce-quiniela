import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '    const myPoints = part ? (boards[urlParticipant]||[]).find ? (() => {\n      let pts=0;\n      state.matches.forEach(m=>{\n        const pred=(state.predictions[urlParticipant]||{})[m.id];\n        if(pred) pts+=pts(pred,m,state.config);\n      });\n      return pts;\n    })() : 0 : 0;'

new = '    const myPoints = part ? (() => {\n      let total=0;\n      state.matches.forEach(m=>{\n        const pred=(state.predictions[urlParticipant]||{})[m.id];\n        if(pred) total+=pts(pred,m,state.config);\n      });\n      return total;\n    })() : 0;'

print("Fix myPoints:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
