import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix 1: agregar import de useRouter
old1 = 'import { useState, useEffect, useMemo, useRef } from "react"'
new1 = 'import { useState, useEffect, useMemo, useRef } from "react"\nimport { useRouter } from "next/router"'
print("Fix 1 import:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix 2: agregar useRouter y leer parametro participant despues de los useState
old2 = '  const pinRef = useRef(null);'
new2 = '  const pinRef = useRef(null);\n  const router = useRouter();\n  const urlParticipant = router.query.participant || null;'
print("Fix 2 router:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

# Fix 3: auto-seleccionar participante si viene en URL
old3 = '  useEffect(()=>{ if(ready) save(state); },[state,ready]);'
new3 = '  useEffect(()=>{ if(ready) save(state); },[state,ready]);\n  useEffect(()=>{ if(urlParticipant && ready) setPid(urlParticipant); },[urlParticipant,ready]);'
print("Fix 3 autoselect:", "OK" if old3 in content else "NO ENCONTRADO")
content = content.replace(old3, new3)

open("pages/index.js", "w", encoding="utf-8").write(content)
