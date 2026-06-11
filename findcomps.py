import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if line.strip().startswith("const Home=") or line.strip().startswith("const Results=") or line.strip().startswith("const Leaderboard=") or line.strip().startswith("const Admin="):
        print(str(i+1) + ": " + repr(line.rstrip()))
