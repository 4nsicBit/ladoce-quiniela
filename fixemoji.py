import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

old = '                        Link\n                      </button>'
new = '                        Link \u2197\n                      </button>'

# Sin emoji, solo texto
old2 = old
new2 = '                        Link\n                      </button>'
content = content.replace(old2, new2)

open("pages/index.js", "w", encoding="utf-8").write(content)
print("OK")
