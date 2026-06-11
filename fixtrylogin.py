import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix tryLogin en App para aceptar valor como parametro
old1 = '  const tryLogin=()=>{\n  const val=pinRef.current?pinRef.current.value:pin;\n  if(val===state.config.adminPin){setAdmin(true);if(pinRef.current)pinRef.current.value="";setPin("");toast2("\u2713 Bienvenido admin");}\n  else toast2(t.admin.wrong);\n};'
new1 = '  const tryLogin=(val)=>{\n  if(val===state.config.adminPin){setAdmin(true);setPin("");toast2("\u2713 Bienvenido admin");}\n  else toast2(t.admin.wrong);\n};'
print("Fix tryLogin:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix Admin: usar pinRef.current.value al llamar tryLogin
old2 = '          <input ref={pinRef} type="password" placeholder="PIN" autoComplete="off" defaultValue="" onKeyDown={e=>e.key==="Enter"&&tryLogin()} style={{flex:1}}/>\n          <button className="primary" onClick={tryLogin}>{t.admin.enter}</button>'
new2 = '          <input ref={pinRef} type="password" placeholder="PIN" autoComplete="off" defaultValue="" onKeyDown={e=>e.key==="Enter"&&tryLogin(pinRef.current?.value||"")} style={{flex:1}}/>\n          <button className="primary" onClick={()=>tryLogin(pinRef.current?.value||"")}>{t.admin.enter}</button>'
print("Fix Admin input:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
