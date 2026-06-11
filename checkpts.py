import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(425, 440):
    print(str(i+1) + ": " + repr(lines[i].rstrip()))
