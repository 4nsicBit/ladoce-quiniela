import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
# Ver lineas justo antes de cada componente
for target in [494, 549, 610, 800]:
    print("--- lineas " + str(target-2) + "-" + str(target+1) + " ---")
    for i in range(target-3, target+2):
        if i < len(lines):
            print(str(i+1) + ": " + repr(lines[i].rstrip()))
