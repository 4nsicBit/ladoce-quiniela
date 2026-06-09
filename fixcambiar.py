import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

old = '          <button className="ghost" onClick={()=>setPid(null)}>{t.pred.change}</button>'
new = '          {!urlParticipant && <button className="ghost" onClick={()=>setPid(null)}>{t.pred.change}</button>}'
print("Fix boton cambiar:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)
open("pages/index.js", "w", encoding="utf-8").write(content)
