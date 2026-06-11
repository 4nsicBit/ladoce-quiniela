import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
print("Total lineas: " + str(len(lines)))
for i, line in enumerate(lines):
    if "Dashboard" in line or "HOME DASHBOARD" in line or "proximos" in line.lower():
        print(str(i+1) + ": " + repr(line.rstrip()))
