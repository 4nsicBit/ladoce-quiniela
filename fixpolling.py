import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

old = '  // Persist\n  useEffect(()=>{ if(ready) save(state); },[state,ready]);'
new = '''  // Persist
  useEffect(()=>{ if(ready) save(state); },[state,ready]);

  // Polling: recargar estado desde Supabase cada 30s para participantes
  useEffect(()=>{
    if(!ready || !urlParticipant) return;
    const interval = setInterval(async ()=>{
      const fresh = await load();
      if(fresh) setState(fresh);
    }, 30000);
    return ()=> clearInterval(interval);
  },[ready, urlParticipant]);'''

print("Fix polling:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)
open("pages/index.js", "w", encoding="utf-8").write(content)
