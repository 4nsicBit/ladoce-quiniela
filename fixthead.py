import sys
sys.stdout.reconfigure(encoding="utf-8")

with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Fix thead - mover NIP y Link despues de Torneo
old_thead = '                <thead><tr>\n                  <th>Nombre</th>\n                  <th>NIP</th>\n                  <th>Link</th>\n                  {PHASES.map(p=><th key={p.key}>{t.phases[p.key].split(" ")[0]}</th>)}\n                  <th>Torneo</th><th></th>\n                </tr></thead>'
new_thead = '                <thead><tr>\n                  <th>Nombre</th>\n                  {PHASES.map(p=><th key={p.key}>{t.phases[p.key].split(" ")[0]}</th>)}\n                  <th>Torneo</th>\n                  <th>NIP</th>\n                  <th>Link</th>\n                  <th></th>\n                </tr></thead>'
print("Fix thead:", "OK" if old_thead in content else "NO ENCONTRADO")
content = content.replace(old_thead, new_thead)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Guardado OK")
