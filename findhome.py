import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "countdown" in line or "next2" in line or "next4" in line or "upcoming" in line:
        print(str(i+1) + ": " + repr(line.rstrip()))
