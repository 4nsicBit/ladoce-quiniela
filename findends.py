import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
print("Total lineas:", len(lines))
markers = [613, 843, 899, 961]
for i, line in enumerate(lines):
    if i+1 in markers:
        print(str(i+1) + " START: " + repr(line.rstrip()))
    if "  // ──" in line and i+1 > 613:
        print(str(i+1) + " SECTION: " + repr(line.rstrip()))
