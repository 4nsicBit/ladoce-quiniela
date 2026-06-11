import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Reemplazar el display del timer en el header para usar un componente separado
# Primero agregar el componente SessionTimer antes del componente App

old_timer_state = '  const [sessionTimer, setSessionTimer] = useState(600); // 10 min en segundos\n\n  // Timer visible de sesion\n  useEffect(()=>{\n    if(!urlParticipant) return;\n    const interval = setInterval(()=>{\n      const ts = parseInt(localStorage.getItem("ld-session-ts") || "0");\n      const elapsed = Math.floor((Date.now() - ts) / 1000);\n      const remaining = Math.max(0, 600 - elapsed);\n      setSessionTimer(remaining);\n      if(remaining === 0){\n        localStorage.removeItem("ld-participant-id");\n        localStorage.removeItem("ld-participant-name");\n        localStorage.removeItem("ld-session-ts");\n        window.location.href = "/p/" + urlParticipant;\n      }\n    }, 1000);\n    // Renovar al hacer click o tecla\n    const renovar = ()=>{\n      localStorage.setItem("ld-session-ts", Date.now().toString());\n      setSessionTimer(600);\n    };\n    window.addEventListener("click", renovar);\n    window.addEventListener("keydown", renovar);\n    return ()=>{\n      clearInterval(interval);\n      window.removeEventListener("click", renovar);\n      window.removeEventListener("keydown", renovar);\n    };\n  },[urlParticipant]);'

new_timer_state = '  // Timer de sesion movido a componente separado para evitar re-renders'

print("Fix timer state:", "OK" if old_timer_state in content else "NO ENCONTRADO")
content = content.replace(old_timer_state, new_timer_state)

# Reemplazar el display del timer en header
old_timer_display = '''          {urlParticipant&&(
            <div style={{
              display:"flex",alignItems:"center",gap:4,
              padding:"4px 10px",borderRadius:20,
              background:sessionTimer<120?"rgba(217,95,95,0.15)":"rgba(91,184,168,0.1)",
              border:`0.5px solid ${sessionTimer<120?"var(--red)":"var(--teal-b)"}`,
              fontSize:"11px",
              color:sessionTimer<120?"var(--red)":"var(--teal)",
            }}>
              {Math.floor(sessionTimer/60)}:{String(sessionTimer%60).padStart(2,"0")}
            </div>
          )}'''

new_timer_display = '          {urlParticipant&&<SessionTimer participantId={urlParticipant}/>}'

print("Fix timer display:", "OK" if old_timer_display in content else "NO ENCONTRADO")
content = content.replace(old_timer_display, new_timer_display)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
