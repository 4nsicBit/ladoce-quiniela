import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '        <div style={{display:"flex",alignItems:"center",gap:10}}>\n          <LogoMark size={30}/>\n          <div>\n            <div style={{fontFamily:"var(--fd)",fontSize:"15px",fontWeight:600,color:"var(--teal)",lineHeight:1.1,letterSpacing:".02em"}}>LA DOCE</div>\n            <div style={{fontSize:"9px",color:"var(--tx3)",letterSpacing:".12em",textTransform:"uppercase"}}>SOCIAL · ROOF · BAR</div>\n          </div>\n        </div>'
new = '        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setView("home");setMenu(false);}}>\n          <LogoMark size={30}/>\n          <div>\n            <div style={{fontFamily:"var(--fd)",fontSize:"15px",fontWeight:600,color:"var(--teal)",lineHeight:1.1,letterSpacing:".02em"}}>LA DOCE</div>\n            <div style={{fontSize:"9px",color:"var(--tx3)",letterSpacing:".12em",textTransform:"uppercase"}}>SOCIAL · ROOF · BAR</div>\n          </div>\n        </div>'
print("Fix logo home:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
