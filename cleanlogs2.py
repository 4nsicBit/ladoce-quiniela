import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/p/[id].js", encoding="utf-8").read()

old = '      console.log("Supabase data:", JSON.stringify(data))\n      console.log("Supabase error:", JSON.stringify(error))\n      if (data) {\n        const state = data.value\n        console.log("Participantes:", JSON.stringify(state.participants?.map(p => ({id:p.id, name:p.name}))))\n        console.log("Buscando id:", id)\n        const found = state.participants.find(p => p.id === id)\n        console.log("Encontrado:", JSON.stringify(found))'
new = '      if (data) {\n        const state = data.value\n        const found = state.participants.find(p => p.id === id)'
print("Fix logs [id].js:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)
open("pages/p/[id].js", "w", encoding="utf-8").write(content)
