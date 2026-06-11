import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "gridTemplateColumns" in line and ("1fr auto 1fr" in line or "48px" in line):
        print(str(i+1) + ": " + repr(line.rstrip()))
