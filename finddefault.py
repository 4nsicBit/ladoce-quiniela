import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
# Ver lineas de DEFAULT_STATE completo
for i, line in enumerate(lines):
    if "grupos" in line and "entryFee" in line:
        print(str(i+1) + ": " + repr(line.rstrip()))
