import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = 'export default function App() {'
new = '''function SessionTimer({ participantId }) {
  const [remaining, setRemaining] = useState(600);

  useEffect(()=>{
    const tick = ()=>{
      const ts = parseInt(localStorage.getItem("ld-session-ts") || "0");
      const elapsed = Math.floor((Date.now() - ts) / 1000);
      const left = Math.max(0, 600 - elapsed);
      setRemaining(left);
      if(left === 0){
        localStorage.removeItem("ld-participant-id");
        localStorage.removeItem("ld-participant-name");
        localStorage.removeItem("ld-session-ts");
        window.location.href = "/p/" + participantId;
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    const renovar = ()=> localStorage.setItem("ld-session-ts", Date.now().toString());
    window.addEventListener("click", renovar);
    window.addEventListener("keydown", renovar);
    return ()=>{
      clearInterval(interval);
      window.removeEventListener("click", renovar);
      window.removeEventListener("keydown", renovar);
    };
  },[participantId]);

  const urgent = remaining < 120;
  return(
    <div style={{
      display:"flex",alignItems:"center",gap:4,
      padding:"4px 10px",borderRadius:20,
      background:urgent?"rgba(217,95,95,0.15)":"rgba(91,184,168,0.1)",
      border:`0.5px solid ${urgent?"var(--red)":"rgba(91,184,168,0.3)"}`,
      fontSize:"11px",
      color:urgent?"var(--red)":"var(--teal)",
    }}>
      {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}
    </div>
  );
}

export default function App() {'''

print("Fix SessionTimer:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
