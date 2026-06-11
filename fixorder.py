import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Mover router y urlParticipant antes del sessionTimer
old = '  const pinRef = useRef(null);\n  const [sessionTimer, setSessionTimer] = useState(600); // 10 min en segundos'
new = '  const pinRef = useRef(null);\n  const router = useRouter();\n  const urlParticipant = router.query.participant || null;\n  const [sessionTimer, setSessionTimer] = useState(600); // 10 min en segundos'
print("Fix order 1:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

# Eliminar la declaracion duplicada de router y urlParticipant
old2 = '  },[urlParticipant]);\n  const router = useRouter();\n  const urlParticipant = router.query.participant || null;\n  const [pid,setPid]'
new2 = '  },[urlParticipant]);\n  const [pid,setPid]'
print("Fix order 2:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
