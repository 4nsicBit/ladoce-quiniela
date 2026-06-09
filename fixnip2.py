import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

old2 = '          <div style={{display:"flex",gap:8,marginBottom:11}}>\n            <input id="np" placeholder={t.admin.addName} style={{flex:1}}\n              onKeyDown={e=>{ if(e.key==="Enter"){addP(e.target.value);e.target.value="";} }}/>\n            <button className="primary" onClick={()=>{ const el=document.getElementById("np"); addP(el.value); el.value=""; }}>\n              <Plus size={13}/>{t.admin.add}\n            </button>\n          </div>'

new2 = '          <div style={{display:"flex",gap:8,marginBottom:11}}>\n            <input id="np" placeholder={t.admin.addName} style={{flex:1}} onKeyDown={e=>{ if(e.key==="Enter"){addP(e.target.value,document.getElementById("np-nip").value);e.target.value="";document.getElementById("np-nip").value="";} }}/>\n            <input id="np-nip" placeholder="NIP" maxLength={4} style={{width:70,textAlign:"center"}} />\n            <button className="primary" onClick={()=>{ const el=document.getElementById("np"); const nip=document.getElementById("np-nip"); addP(el.value,nip.value); el.value=""; nip.value=""; }}>\n              <Plus size={13}/>{t.admin.add}\n            </button>\n          </div>'

print("Fix 2:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)
open("pages/index.js", "w", encoding="utf-8").write(content)
