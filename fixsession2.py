import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/p/[id].js", encoding="utf-8").read()

old = '      localStorage.setItem("ld-participant-id", id)\n      localStorage.setItem("ld-participant-name", participant.name)\n      router.push("/?participant=" + id)'
new = '      localStorage.setItem("ld-participant-id", id)\n      localStorage.setItem("ld-participant-name", participant.name)\n      localStorage.setItem("ld-session-ts", Date.now().toString())\n      router.push("/?participant=" + id)'
print("Fix timestamp login:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)
open("pages/p/[id].js", "w", encoding="utf-8").write(content)
