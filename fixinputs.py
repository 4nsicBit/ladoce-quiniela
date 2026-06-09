import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix entrada MXN - de onChange a onBlur
old1 = '                      <input type="number" min="0" value={pool.entryFee} onChange={e=>updPool(key,"entryFee",parseInt(e.target.value)||0)}/>'
new1 = '                      <input type="number" min="0" key={`fee-${key}`} defaultValue={pool.entryFee} onBlur={e=>updPool(key,"entryFee",parseInt(e.target.value)||0)}/>'
print("Fix entryFee:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix distribution - de onChange a onBlur
old2 = '                      <input type="text" value={pool.distribution.join(",")} onChange={e=>updPool(key,"distribution",e.target.value.split(",").map(x=>parseFloat(x)||0))}/>'
new2 = '                      <input type="text" key={`dist-${key}`} defaultValue={pool.distribution.join(",")} onBlur={e=>updPool(key,"distribution",e.target.value.split(",").map(x=>parseFloat(x)||0))}/>'
print("Fix distribution:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

open("pages/index.js", "w", encoding="utf-8").write(content)
