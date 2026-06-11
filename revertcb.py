import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Revertir useCallback
old = '  const Predictions = useCallback(()=>{'
new = '  const Predictions = ()=>{'
print("Revert:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

old2 = '  },[pid,phase,state.participants,state.predictions,state.matches,t,urlParticipant]);'
new2 = '  };'
print("Revert deps:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
