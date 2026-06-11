import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# El patron es: body termina con "  };\n}" - quitar el "  };" extra de cada componente
import re

# Limpiar cierres dobles en cada componente externo
for name in ["Home", "Results", "Leaderboard", "Admin"]:
    # Patron: "  };\n}" al final del componente -> solo "}"
    content = re.sub(r'  \};\n\}(\n\nfunction )', r'}\1', content)
    content = re.sub(r'  \};\n\}(\n\n// )', r'}\1', content)

# Tambien limpiar el ultimo componente Admin
content = re.sub(r'  \};\n\}\n(\n// ── RENDER)', r'}\n\1', content)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
print("OK")
