import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(238, 310):
    if any(x in lines[i] for x in ["pinRef", "sessionTimer", "useRouter", "urlParticipant", "useState", "useEffect"]):
        print(str(i+1) + ": " + repr(lines[i].rstrip()))
