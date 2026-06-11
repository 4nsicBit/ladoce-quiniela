import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "mxn(" in line.lower() and ("prize" in line.lower() or "pot" in line.lower() or "pots" in line.lower() or "fmtMXN" in line.lower()):
        print(str(i+1) + ": " + repr(line.rstrip()))
