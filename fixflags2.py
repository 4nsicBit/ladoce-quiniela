import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

flag_map = """
const FLAGS = {
  "Mexico":"mx","Argentina":"ar","Brasil":"br","Francia":"fr",
  "Inglaterra":"gb-eng","Espana":"es","Alemania":"de",
  "Portugal":"pt","Paises Bajos":"nl","Belgica":"be",
  "Uruguay":"uy","Colombia":"co","Ecuador":"ec",
  "Paraguay":"py","Estados Unidos":"us","Canada":"ca",
  "Panama":"pa","Marruecos":"ma","Senegal":"sn",
  "Ghana":"gh","Costa de Marfil":"ci","Egipto":"eg",
  "Sudafrica":"za","Cabo Verde":"cv","RD Congo":"cd",
  "Argelia":"dz","Jordania":"jo","Irak":"iq",
  "Arabia Saudita":"sa","Iran":"ir","Japon":"jp",
  "Corea del Sur":"kr","Australia":"au","Uzbekistan":"uz",
  "Qatar":"qa","Suiza":"ch","Chequia":"cz","Croacia":"hr",
  "Escocia":"gb-sct","Bosnia y Herz.":"ba","Noruega":"no",
  "Suecia":"se","Tunez":"tn","Nueva Zelanda":"nz",
  "Curazao":"cw","Haiti":"ht","Turquia":"tr","Austria":"at",
  "Sudan":"sd","Irak":"iq",
};

const flagUrl = (team) => {
  if(!team) return null;
  const normalized = team
    .normalize("NFD").replace(/[\\u0300-\\u036f]/g,"")
    .replace("Estados Unidos","us")
    .replace("Canada","ca");
  const code = FLAGS[normalized] || FLAGS[team];
  return code ? "https://flagcdn.com/w160/" + code + ".png" : null;
};
"""

marker = "const DEFAULT={"
if marker in content:
    content = content.replace(marker, flag_map + "\n" + marker)
    print("FLAG MAP: OK")
else:
    print("FLAG MAP: NO ENCONTRADO - buscando alternativa")
    for i, line in enumerate(content.split("\n")):
        if "const DEFAULT" in line:
            print("Encontrado en linea " + str(i+1) + ": " + line[:60])

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
