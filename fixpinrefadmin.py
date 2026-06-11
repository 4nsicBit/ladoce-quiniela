import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Agregar pinRef dentro de Admin como primer statement
old = 'function Admin({state,upd,isAdmin,setAdmin,pin,setPin,tryLogin,addP,removeP,\n  togglePay,updM,toggleLock,lockPhase,updPool,exportData,importData,\n  pots,toast2,t,lang,PHASES,status,fmtD}) {'
new = 'function Admin({state,upd,isAdmin,setAdmin,pin,setPin,tryLogin,addP,removeP,\n  togglePay,updM,toggleLock,lockPhase,updPool,exportData,importData,\n  pots,toast2,t,lang,PHASES,status,fmtD}) {\n  const pinRef = useRef(null);'
print("Fix pinRef Admin:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
