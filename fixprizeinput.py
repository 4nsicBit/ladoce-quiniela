import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Agregar PrizeInput externo junto a PredInput
old = 'function SessionTimer({ participantId }) {'
new = '''function PrizeInput({ initialValue, onSave }) {
  const [val, setVal] = useState(initialValue || 0);
  const inputRef = useRef(null);
  useEffect(()=>{
    if(inputRef.current && document.activeElement === inputRef.current) return;
    setVal(initialValue || 0);
  },[initialValue]);
  return(
    <input
      ref={inputRef}
      type="number" min="0"
      value={val}
      onChange={e=>setVal(e.target.value)}
      onBlur={e=>onSave(parseInt(e.target.value)||0)}
      style={{width:"100%"}}
    />
  );
}

function SessionTimer({ participantId }) {'''

print("PrizeInput:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

# Reemplazar el input de premios por PrizeInput
old2 = '                          <input type="number" min="0"\n                            key={`prize-${key}-${i}`}\n                            defaultValue={pool.prizes?.[i]||0}\n                            onBlur={e=>{\n                              const newPrizes=[...(pool.prizes||[0,0,0])];\n                              newPrizes[i]=parseInt(e.target.value)||0;\n                              updPool(key,"prizes",newPrizes);\n                            }}\n                          />'
new2 = '                          <PrizeInput\n                            key={`prize-${key}-${i}`}\n                            initialValue={pool.prizes?.[i]||0}\n                            onSave={v=>{\n                              const newPrizes=[...(pool.prizes||[0,0,0])];\n                              newPrizes[i]=v;\n                              updPool(key,"prizes",newPrizes);\n                            }}\n                          />'
print("Fix input premio:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
