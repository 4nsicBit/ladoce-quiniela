import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

old = '                        type="text" maxLength={4}\n                        value={p.nip||"1234"}\n                        onChange={e=>upd(s=>({...s,participants:s.participants.map(x=>x.id===p.id?{...x,nip:e.target.value.replace(/\\D/g,"")}:x)}))}\n                        style={{width:52,textAlign:"center",padding:"3px 6px",fontSize:13}}\n                      />'
new = '                        type="text" maxLength={4}\n                        key={`nip-${p.id}`}\n                        defaultValue={p.nip||"1234"}\n                        onBlur={e=>upd(s=>({...s,participants:s.participants.map(x=>x.id===p.id?{...x,nip:e.target.value.replace(/\\D/g,"")}:x)}))}\n                        style={{width:52,textAlign:"center",padding:"3px 6px",fontSize:13}}\n                      />'
print("Fix NIP tabla:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)
open("pages/index.js", "w", encoding="utf-8").write(content)
