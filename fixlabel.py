import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '    <div style={{\n      display:"flex",alignItems:"center",gap:4,\n      padding:"4px 10px",borderRadius:20,\n      background:urgent?"rgba(217,95,95,0.15)":"rgba(91,184,168,0.1)",\n      border:`0.5px solid ${urgent?"var(--red)":"rgba(91,184,168,0.3)"}`,\n      fontSize:"11px",\n      color:urgent?"var(--red)":"var(--teal)",\n    }}>\n      {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}\n    </div>'

new = '    <div style={{\n      display:"flex",alignItems:"center",gap:4,\n      padding:"4px 10px",borderRadius:20,\n      background:urgent?"rgba(217,95,95,0.15)":"rgba(91,184,168,0.1)",\n      border:`0.5px solid ${urgent?"var(--red)":"rgba(91,184,168,0.3)"}`,\n      fontSize:"11px",\n      color:urgent?"var(--red)":"var(--teal)",\n    }}>\n      <span style={{opacity:0.7}}>{urgent?"Sesion expira:":"Sesion:"}</span>\n      <span style={{fontWeight:500}}>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}</span>\n    </div>'

print("Fix timer label:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
