import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

old = 'import { useState, useEffect, useMemo, useRef } from "react"'
new = 'import { useState, useEffect, useMemo, useRef, useCallback } from "react"'
print("Fix import:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
