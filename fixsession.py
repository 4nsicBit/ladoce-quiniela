import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix 1: agregar timestamp de sesion al hacer login exitoso en [id].js
# Primero en index.js agregamos el useEffect de sesion despues del autoselect

old1 = '  useEffect(()=>{ if(urlParticipant && ready) setPid(urlParticipant); },[urlParticipant,ready]);'
new1 = '''  useEffect(()=>{ if(urlParticipant && ready) setPid(urlParticipant); },[urlParticipant,ready]);

  // Sesion de 10 minutos para participantes con link
  useEffect(()=>{
    if(!urlParticipant) return;
    const SESSION_KEY = "ld-session-ts";
    const SESSION_DURATION = 10 * 60 * 1000; // 10 minutos
    // Iniciar sesion si no existe
    if(!localStorage.getItem(SESSION_KEY)){
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    }
    // Revisar cada 30 segundos
    const interval = setInterval(()=>{
      const ts = parseInt(localStorage.getItem(SESSION_KEY) || "0");
      if(Date.now() - ts > SESSION_DURATION){
        localStorage.removeItem("ld-participant-id");
        localStorage.removeItem("ld-participant-name");
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "/p/" + urlParticipant;
      }
    }, 30000);
    // Renovar sesion en cada interaccion
    const renovar = ()=> localStorage.setItem(SESSION_KEY, Date.now().toString());
    window.addEventListener("click", renovar);
    window.addEventListener("keydown", renovar);
    return ()=>{
      clearInterval(interval);
      window.removeEventListener("click", renovar);
      window.removeEventListener("keydown", renovar);
    };
  },[urlParticipant]);'''

print("Fix sesion:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)
open("pages/index.js", "w", encoding="utf-8").write(content)
