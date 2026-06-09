content = open('pages/index.js', encoding='utf-8').read()
old2 = 'const fmtD=(iso,lang)=>{ const d=new Date(iso),mo=T[lang].months; return ${d.getDate()}  :; };'
new2 = 'const fmtD=(iso,lang)=>{ const mo=T[lang].months; const d=new Date(new Date(iso).toLocaleString("en-US",{timeZone:"America/Mexico_City"})); return ${d.getDate()}  :; };'
print('Fix 2 fmtD:', 'OK' if old2 in content else 'NO ENCONTRADO')
open('pages/index.js', 'w', encoding='utf-8').write(content.replace(old2, new2))
