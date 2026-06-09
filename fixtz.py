content = open('pages/index.js', encoding='utf-8').read()

# Fix 1: Corregir fechas base de grupos (primer partido 13:00 CDMX)
old1 = 'const bases = ["2026-06-11T20:00:00-06:00","2026-06-19T20:00:00-06:00","2026-06-26T20:00:00-06:00"];'
new1 = 'const bases = ["2026-06-11T13:00:00-06:00","2026-06-19T13:00:00-06:00","2026-06-26T13:00:00-06:00"];'
print('Fix 1 fechas base:', 'OK' if old1 in content else 'NO ENCONTRADO')
content = content.replace(old1, new1)

# Fix 2: forzar timezone CDMX en fmtD
old2 = 'const fmtD=(iso,lang)=>{ const d=new Date(iso),mo=T[lang].months; return ${d.getDate()}  :; };'
new2 = 'const fmtD=(iso,lang)=>{ const mo=T[lang].months; const d=new Date(new Date(iso).toLocaleString("en-US",{timeZone:"America/Mexico_City"})); return ${d.getDate()}  :; };'
print('Fix 2 fmtD:', 'OK' if old2 in content else 'NO ENCONTRADO')
content = content.replace(old2, new2)

open('pages/index.js', 'w', encoding='utf-8').write(content)
