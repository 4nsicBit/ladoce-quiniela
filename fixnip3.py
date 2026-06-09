import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

# Fix 1: agregar columna NIP al header
old1 = '                  <th>Nombre</th>'
new1 = '                  <th>Nombre</th>\n                  <th>NIP</th>\n                  <th>Link</th>'
print("Header:", "OK" if old1 in content else "NO ENCONTRADO")
content = content.replace(old1, new1)

# Fix 2: agregar celda NIP y boton link en cada fila
old2 = '                    <td><button className="danger" onClick={()=>removeP(p.id)} style={{padding:"3px 7px"}}><Trash2 size={11}/></button></td>'
new2 = '''                    <td>
                      <input
                        type="text" maxLength={4}
                        value={p.nip||"1234"}
                        onChange={e=>upd(s=>({...s,participants:s.participants.map(x=>x.id===p.id?{...x,nip:e.target.value.replace(/\\D/g,"")}:x)}))}
                        style={{width:52,textAlign:"center",padding:"3px 6px",fontSize:13}}
                      />
                    </td>
                    <td>
                      <button
                        onClick={()=>{
                          const url=`${window.location.origin}/p/${p.id}`;
                          navigator.clipboard.writeText(url);
                          toast2("Link copiado");
                        }}
                        style={{padding:"3px 8px",fontSize:11}}
                        title="Copiar link"
                      >
                        Link
                      </button>
                    </td>
                    <td><button className="danger" onClick={()=>removeP(p.id)} style={{padding:"3px 7px"}}><Trash2 size={11}/></button></td>'''
print("Fila:", "OK" if old2 in content else "NO ENCONTRADO")
content = content.replace(old2, new2)

open("pages/index.js", "w", encoding="utf-8").write(content)
