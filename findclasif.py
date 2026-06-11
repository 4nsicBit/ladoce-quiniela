import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "Clasificacion general" in line or "tieNote" in line or "lb.tieNote" in line:
        print(str(i+1) + ": " + repr(line.rstrip()))
