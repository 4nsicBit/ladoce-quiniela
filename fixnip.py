import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix 1: agregar nip al crear participante
old1 = "const addP=(name)=>{ if(!name.trim()) return; upd(s=>({...s,participants:[...s.participants,{id:`p${Date.now()}`,name:name.trim(),payments:{}}]})); };"
new1 = "const addP=(name,nip)=>{ if(!name.trim()) return; upd(s=>({...s,participants:[...s.participants,{id:`p${Date.now()}`,name:name.trim(),payments:{},nip:nip||\"1234\"}]})); };"
print("Fix 1:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix 2: boton agregar con campo NIP
old2 = '<input id="np" placeholder={t.admin.addName} style={{flex:1}}\n              onKeyDown={e=>{ if(e.key==="Enter"){addP(e.target.value);e.target.value="";} }}/>\n          <button className="primary" onClick={()=>{ const el=document.getElementById("np"); addP(el.value); el.value=""; }}>'
new2 = '<input id="np" placeholder={t.admin.addName} style={{flex:1}} onKeyDown={e=>{ if(e.key==="Enter"){addP(e.target.value,document.getElementById("np-nip").value);e.target.value="";document.getElementById("np-nip").value="";} }}/>\n          <input id="np-nip" placeholder="NIP" maxLength={4} style={{width:70}} />\n          <button className="primary" onClick={()=>{ const el=document.getElementById("np"); const nip=document.getElementById("np-nip"); addP(el.value,nip.value); el.value=""; nip.value=""; }}>'
print("Fix 2:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

open("pages/index.js", "w", encoding="utf-8").write(content)
