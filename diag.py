import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()
lines = content.split("\n")
print("Total lineas: " + str(len(lines)))
checks = [
    ("FLAG MAP", "const FLAGS ="),
    ("Dashboard", "HOME DASHBOARD"),
    ("Bloqueo 30min", "30*60*1000"),
    ("Sesion 10min", "SESSION_DURATION"),
    ("Polling", "Polling: recargar"),
    ("pinRef", "pinRef = useRef"),
    ("Supabase save", "onConflict"),
    ("Banderas", "flagUrl"),
]
for label, text in checks:
    status = "OK" if text in content else "FALTA"
    print(label + ": " + status)
