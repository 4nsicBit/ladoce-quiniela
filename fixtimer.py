import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Agregar estado del timer despues de pinRef
old = '  const pinRef = useRef(null);'
new = '''  const pinRef = useRef(null);
  const [sessionTimer, setSessionTimer] = useState(600); // 10 min en segundos

  // Timer visible de sesion
  useEffect(()=>{
    if(!urlParticipant) return;
    const interval = setInterval(()=>{
      const ts = parseInt(localStorage.getItem("ld-session-ts") || "0");
      const elapsed = Math.floor((Date.now() - ts) / 1000);
      const remaining = Math.max(0, 600 - elapsed);
      setSessionTimer(remaining);
      if(remaining === 0){
        localStorage.removeItem("ld-participant-id");
        localStorage.removeItem("ld-participant-name");
        localStorage.removeItem("ld-session-ts");
        window.location.href = "/p/" + urlParticipant;
      }
    }, 1000);
    // Renovar al hacer click o tecla
    const renovar = ()=>{
      localStorage.setItem("ld-session-ts", Date.now().toString());
      setSessionTimer(600);
    };
    window.addEventListener("click", renovar);
    window.addEventListener("keydown", renovar);
    return ()=>{
      clearInterval(interval);
      window.removeEventListener("click", renovar);
      window.removeEventListener("keydown", renovar);
    };
  },[urlParticipant]);'''

print("Fix timer state:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

# Agregar timer en el header junto al toggle de idioma
old2 = '          <button className="ghost" onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{padding:"4px 10px",fontSize:"11px",borderRadius:20}}>\n            <Globe size={11}/> {lang==="es"?"EN":"ES"}\n          </button>'
new2 = '''          {urlParticipant&&(
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
          )}
          <button className="ghost" onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{padding:"4px 10px",fontSize:"11px",borderRadius:20}}>
            <Globe size={11}/> {lang==="es"?"EN":"ES"}
          </button>'''

print("Fix timer header:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
