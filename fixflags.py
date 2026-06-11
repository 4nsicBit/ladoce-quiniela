import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Agregar mapa de banderas despues de PHASES_CONFIG
flag_map = """
// Mapa de banderas por equipo (flagcdn.com + emoji)
const FLAGS = {
  "Mexico":"mx","Mexico\xf3":"mx","M\xe9xico":"mx",
  "Argentina":"ar","Brasil":"br","Francia":"fr",
  "Inglaterra":"gb-eng","Espa\xf1a":"es","Alemania":"de",
  "Portugal":"pt","Pa\xedses Bajos":"nl","B\xe9lgica":"be",
  "Uruguay":"uy","Colombia":"co","Ecuador":"ec",
  "Per\xfa":"pe","Chile":"cl","Paraguay":"py",
  "Estados Unidos":"us","Canad\xe1":"ca","M\xe9xico":"mx",
  "Costa Rica":"cr","Panam\xe1":"pa","Jamaica":"jm",
  "Marruecos":"ma","Senegal":"sn","Nigeria":"ng",
  "Ghana":"gh","C\xf4te d\x27Ivoire":"ci","Costa de Marfil":"ci",
  "Egipto":"eg","Sud\xe1frica":"za","Sudafrica":"za",
  "Cabo Verde":"cv","RD Congo":"cd","Argelia":"dz",
  "Jord\xe1nia":"jo","Jordania":"jo","Irak":"iq",
  "Arabia Saudita":"sa","Ir\xe1n":"ir","Iran":"ir",
  "Jap\xf3n":"jp","Corea del Sur":"kr","Australia":"au",
  "Uzbekist\xe1n":"uz","Uzbekistan":"uz","Qatar":"qa",
  "Suiza":"ch","Chequia":"cz","Croacia":"hr",
  "Escocia":"gb-sct","Bosnia y Herz.":"ba","Noruega":"no",
  "Suecia":"se","T\xfanez":"tn","Nueva Zelanda":"nz",
  "Curazao":"cw","Haiti":"ht","Ha\xedt\xed":"ht",
  "Turqu\xeda":"tr","Turquia":"tr","Austria":"at",
  "Islandia":"is","Gales":"gb-wls",
};

const flagUrl = (team) => {
  const code = FLAGS[team];
  return code ? \`https://flagcdn.com/w160/\${code}.png\` : null;
};

const flagEmoji = (team) => {
  const code = FLAGS[team];
  if(!code) return "";
  const base = code.split("-")[0];
  const map = {
    mx:"\uD83C\uDDF2\uD83C\uDDFD",ar:"\uD83C\uDDE6\uD83C\uDDF7",br:"\uD83C\uDDE7\uD83C\uDDF7",
    fr:"\uD83C\uDDEB\uD83C\uDDF7",es:"\uD83C\uDDEA\uD83C\uDDF8",de:"\uD83C\uDDE9\uD83C\uDDEA",
    pt:"\uD83C\uDDF5\uD83C\uDDF9",nl:"\uD83C\uDDF3\uD83C\uDDF1",be:"\uD83C\uDDE7\uD83C\uDDEA",
    uy:"\uD83C\uDDFA\uD83C\uDDFE",co:"\uD83C\uDDE8\uD83C\uDDF4",ec:"\uD83C\uDDEA\uD83C\uDDE8",
    us:"\uD83C\uDDFA\uD83C\uDDF8",ca:"\uD83C\uDDE8\uD83C\uDDE6",py:"\uD83C\uDDF5\uD83C\uDDFE",
    pa:"\uD83C\uDDF5\uD83C\uDDE6",ma:"\uD83C\uDDF2\uD83C\uDDE6",sn:"\uD83C\uDDF8\uD83C\uDDF3",
    gh:"\uD83C\uDDEC\uD83C\uDDED",ci:"\uD83C\uDDE8\uD83C\uDDEE",eg:"\uD83C\uDDEA\uD83C\uDDEC",
    za:"\uD83C\uDDFF\uD83C\uDDE6",cv:"\uD83C\uDDE8\uD83C\uDDFB",cd:"\uD83C\uDDE8\uD83C\uDDE9",
    dz:"\uD83C\uDDE9\uD83C\uDDFF",jo:"\uD83C\uDDEF\uD83C\uDDF4",iq:"\uD83C\uDDEE\uD83C\uDDF6",
    sa:"\uD83C\uDDF8\uD83C\uDDE6",ir:"\uD83C\uDDEE\uD83C\uDDF7",jp:"\uD83C\uDDEF\uD83C\uDDF5",
    kr:"\uD83C\uDDF0\uD83C\uDDF7",au:"\uD83C\uDDE6\uD83C\uDDFA",uz:"\uD83C\uDDFA\uD83C\uDDFF",
    qa:"\uD83C\uDDF6\uD83C\uDDE6",ch:"\uD83C\uDDE8\uD83C\uDDED",cz:"\uD83C\uDDE8\uD83C\uDDFF",
    hr:"\uD83C\uDDED\uD83C\uDDF7",ba:"\uD83C\uDDE7\uD83C\uDDE6",no:"\uD83C\uDDF3\uD83C\uDDF4",
    se:"\uD83C\uDDF8\uD83C\uDDEA",tn:"\uD83C\uDDF9\uD83C\uDDF3",nz:"\uD83C\uDDF3\uD83C\uDDFF",
    cw:"\uD83C\uDDE8\uD83C\uDDFC",ht:"\uD83C\uDDED\uD83C\uDDF9",tr:"\uD83C\uDDF9\uD83C\uDDF7",
    at:"\uD83C\uDDE6\uD83C\uDDF9",gb:"\uD83C\uDDEC\uD83C\uDDE7",
  };
  return map[base] || "";
};
"""

# Insertar despues de PHASES_CONFIG
marker = "const DEFAULT={"
if marker in content:
    content = content.replace(marker, flag_map + "\n" + marker)
    print("FLAG MAP: OK")
else:
    print("FLAG MAP: NO ENCONTRADO")

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
