import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()
checks = [
    ("bloqueo 30min", "30*60*1000"),
    ("polling participantes", "Polling: recargar"),
    ("sesion 10min", "SESSION_DURATION"),
    ("pinRef", "pinRef = useRef"),
    ("supabase save", "onConflict"),
]
for label, text in checks:
    status = "OK" if text in content else "FALTA"
    print(label + ": " + status)
