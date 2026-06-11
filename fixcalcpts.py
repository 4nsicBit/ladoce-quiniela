import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '        if(pred) pts+=calcPts(pred,m,state.config);'
new = '        if(pred) pts+=pts(pred,m,state.config);'
print("Fix calcPts:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
