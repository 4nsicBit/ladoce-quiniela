import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "distribution" in line and ("pools" in line or "entryFee" in line or "pool" in line):
        print(str(i+1) + ": " + repr(line.rstrip()))
