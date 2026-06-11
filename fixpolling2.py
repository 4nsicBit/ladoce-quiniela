import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '    const interval = setInterval(async ()=>{\n      const fresh = await load();\n      if(fresh) setState(fresh);\n    }, 30000);'

new = '    const interval = setInterval(async ()=>{\n      const fresh = await load();\n      if(fresh) setState(prev=>({...prev,\n        // Solo actualizar partidos y resultados, no predicciones ni config\n        // para evitar perder el foco en inputs mientras el usuario escribe\n        matches: fresh.matches,\n        participants: fresh.participants,\n        pools: fresh.pools,\n      }));\n    }, 30000);'

print("Fix polling:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
