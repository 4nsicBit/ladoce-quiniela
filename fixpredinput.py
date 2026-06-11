import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Agregar componente PredInput antes de SessionTimer
old = 'function SessionTimer({ participantId }) {'
new = '''function PredInput({ matchId, field, initialValue, disabled, onSave }) {
  const [val, setVal] = useState(initialValue || "");
  const timerRef = useRef(null);

  // Sincronizar si el valor externo cambia y el input no tiene foco
  const inputRef = useRef(null);
  useEffect(()=>{
    if(document.activeElement !== inputRef.current){
      setVal(initialValue || "");
    }
  },[initialValue]);

  const handleChange = (e) => {
    const v = e.target.value;
    setVal(v);
    // Guardar 800ms despues de parar de escribir
    if(timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(()=> onSave(v), 800);
  };

  const handleBlur = (e) => {
    if(timerRef.current) clearTimeout(timerRef.current);
    onSave(e.target.value);
  };

  return(
    <input
      ref={inputRef}
      type="number" min="0" max="20"
      className="si"
      value={val}
      disabled={disabled}
      onChange={handleChange}
      onBlur={handleBlur}
      style={{width:38}}
    />
  );
}

function SessionTimer({ participantId }) {'''

print("PredInput:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

# Reemplazar inputs de pronosticos por PredInput
old2 = '                  <input type="number" min="0" max="20" className="si" key={`ph-${m.id}`} defaultValue={pr.home} disabled={m.locked||!m.home} onBlur={e=>setPred(pid,m.id,"home",e.target.value)} style={{width:38}}/>'
new2 = '                  <PredInput key={`ph-${m.id}`} matchId={m.id} field="home" initialValue={pr.home} disabled={m.locked||!m.home} onSave={v=>setPred(pid,m.id,"home",v)}/>'
print("Fix input home:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

old3 = '                  <input type="number" min="0" max="20" className="si" key={`pa-${m.id}`} defaultValue={pr.away} disabled={m.locked||!m.away} onBlur={e=>setPred(pid,m.id,"away",e.target.value)} style={{width:38}}/>'
new3 = '                  <PredInput key={`pa-${m.id}`} matchId={m.id} field="away" initialValue={pr.away} disabled={m.locked||!m.away} onSave={v=>setPred(pid,m.id,"away",v)}/>'
print("Fix input away:", "OK" if old3 in content else "NO ENCONTRADO")
content = content.replace(old3, new3)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
