import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "m.home" in line and ("fontSize" in line or "textAlign" in line):
        print(str(i+1) + ": " + repr(line.rstrip()))
