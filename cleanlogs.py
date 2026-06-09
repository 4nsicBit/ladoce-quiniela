import sys
sys.stdout.reconfigure(encoding="utf-8")
content = open("pages/index.js", encoding="utf-8").read()

old = "const save=async(s)=>{\n  try{\n    console.log('Guardando en Supabase...');\n    const {error}=await supabase.from('config').upsert({key:SK,value:s},{onConflict:'key'});\n    if(error) console.error('Error Supabase:', error);\n    else console.log('Guardado OK');\n  }catch(e){console.error('Error save:',e);}\n};"
new = "const save=async(s)=>{\n  try{\n    await supabase.from('config').upsert({key:SK,value:s},{onConflict:'key'});\n  }catch{}\n};"
print("Fix logs:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)
open("pages/index.js", "w", encoding="utf-8").write(content)
