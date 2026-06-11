import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = '  const [remaining, setRemaining] = useState(600);'
new = '''  const [remaining, setRemaining] = useState(()=>{
    if(typeof window === "undefined") return 600;
    const ts = parseInt(localStorage.getItem("ld-session-ts") || "0");
    const elapsed = Math.floor((Date.now() - ts) / 1000);
    return Math.max(0, 600 - elapsed);
  });'''

print("Fix timer init:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
