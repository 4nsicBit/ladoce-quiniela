import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Reemplazar makeKickoff y generateGroupMatches con datos reales
old = """const makeKickoff = (gi, mi) => {
  const round = mi < 2 ? 0 : mi < 4 ? 1 : 2;
  const bases = ["2026-06-11T13:00:00-06:00","2026-06-19T13:00:00-06:00","2026-06-26T13:00:00-06:00"];
  return new Date(new Date(bases[round]).getTime() + ((gi*8+mi*3)%48)*3600000).toISOString();
};

const generateGroupMatches = () => {
  const m=[]; let id=1;
  Object.keys(GROUPS_2026).forEach((g,gi)=>{
    const t=GROUPS_2026[g]; let mi=0;
    for(let i=0;i<t.length;i++) for(let j=i+1;j<t.length;j++){
      m.push({id:`G${String(id).padStart(3,"0")}`,phase:"grupos",group:g,home:t[i],away:t[j],homeScore:null,awayScore:null,kickoff:makeKickoff(gi,mi),locked:false});
      id++; mi++;
    }
  });
  return m;
};"""

new = """// Partidos reales con fechas/horarios oficiales (horario CDMX GMT-6)
// Fuente: Fox Sports / FIFA oficial
const GROUP_MATCHES_DATA = [
  // Jun 11
  {g:"A",h:"México",a:"Sudáfrica",k:"2026-06-11T14:00:00-06:00"},
  {g:"A",h:"Corea del Sur",a:"Chequia",k:"2026-06-11T21:00:00-06:00"},
  // Jun 12
  {g:"B",h:"Canadá",a:"Bosnia y Herz.",k:"2026-06-12T14:00:00-06:00"},
  {g:"D",h:"Estados Unidos",a:"Paraguay",k:"2026-06-12T20:00:00-06:00"},
  // Jun 13
  {g:"B",h:"Qatar",a:"Suiza",k:"2026-06-13T14:00:00-06:00"},
  {g:"C",h:"Brasil",a:"Marruecos",k:"2026-06-13T17:00:00-06:00"},
  {g:"C",h:"Haití",a:"Escocia",k:"2026-06-13T20:00:00-06:00"},
  {g:"D",h:"Australia",a:"Turquía",k:"2026-06-13T23:00:00-06:00"},
  // Jun 14
  {g:"E",h:"Alemania",a:"Curazao",k:"2026-06-14T12:00:00-06:00"},
  {g:"F",h:"Países Bajos",a:"Japón",k:"2026-06-14T15:00:00-06:00"},
  {g:"E",h:"Costa de Marfil",a:"Ecuador",k:"2026-06-14T18:00:00-06:00"},
  {g:"F",h:"Túnez",a:"Suecia",k:"2026-06-14T21:00:00-06:00"},
  // Jun 15
  {g:"H",h:"España",a:"Cabo Verde",k:"2026-06-15T11:00:00-06:00"},
  {g:"G",h:"Bélgica",a:"Egipto",k:"2026-06-15T14:00:00-06:00"},
  {g:"H",h:"Arabia Saudita",a:"Uruguay",k:"2026-06-15T17:00:00-06:00"},
  {g:"G",h:"Irán",a:"Nueva Zelanda",k:"2026-06-15T20:00:00-06:00"},
  // Jun 16
  {g:"I",h:"Francia",a:"Senegal",k:"2026-06-16T14:00:00-06:00"},
  {g:"I",h:"Irak",a:"Noruega",k:"2026-06-16T17:00:00-06:00"},
  {g:"J",h:"Argentina",a:"Argelia",k:"2026-06-16T20:00:00-06:00"},
  {g:"J",h:"Austria",a:"Jordania",k:"2026-06-16T23:00:00-06:00"},
  // Jun 17
  {g:"K",h:"Portugal",a:"RD Congo",k:"2026-06-17T12:00:00-06:00"},
  {g:"L",h:"Inglaterra",a:"Croacia",k:"2026-06-17T15:00:00-06:00"},
  {g:"L",h:"Ghana",a:"Panamá",k:"2026-06-17T18:00:00-06:00"},
  {g:"K",h:"Uzbekistán",a:"Colombia",k:"2026-06-17T21:00:00-06:00"},
  // Jun 18
  {g:"A",h:"Chequia",a:"Sudáfrica",k:"2026-06-18T11:00:00-06:00"},
  {g:"B",h:"Suiza",a:"Bosnia y Herz.",k:"2026-06-18T14:00:00-06:00"},
  {g:"B",h:"Canadá",a:"Qatar",k:"2026-06-18T17:00:00-06:00"},
  {g:"A",h:"México",a:"Corea del Sur",k:"2026-06-18T20:00:00-06:00"},
  // Jun 19
  {g:"D",h:"Estados Unidos",a:"Australia",k:"2026-06-19T14:00:00-06:00"},
  {g:"C",h:"Escocia",a:"Marruecos",k:"2026-06-19T14:00:00-06:00"},
  {g:"C",h:"Brasil",a:"Haití",k:"2026-06-19T20:00:00-06:00"},
  {g:"D",h:"Turquía",a:"Paraguay",k:"2026-06-19T23:00:00-06:00"},
  // Jun 20
  {g:"F",h:"Países Bajos",a:"Suecia",k:"2026-06-20T12:00:00-06:00"},
  {g:"E",h:"Alemania",a:"Costa de Marfil",k:"2026-06-20T15:00:00-06:00"},
  {g:"E",h:"Ecuador",a:"Curazao",k:"2026-06-20T19:00:00-06:00"},
  {g:"F",h:"Túnez",a:"Japón",k:"2026-06-20T23:00:00-06:00"},
  // Jun 21
  {g:"H",h:"España",a:"Arabia Saudita",k:"2026-06-21T11:00:00-06:00"},
  {g:"G",h:"Bélgica",a:"Irán",k:"2026-06-21T14:00:00-06:00"},
  {g:"H",h:"Uruguay",a:"Cabo Verde",k:"2026-06-21T17:00:00-06:00"},
  {g:"G",h:"Nueva Zelanda",a:"Egipto",k:"2026-06-21T20:00:00-06:00"},
  // Jun 22
  {g:"J",h:"Argentina",a:"Austria",k:"2026-06-22T12:00:00-06:00"},
  {g:"I",h:"Francia",a:"Irak",k:"2026-06-22T16:00:00-06:00"},
  {g:"I",h:"Noruega",a:"Senegal",k:"2026-06-22T19:00:00-06:00"},
  {g:"J",h:"Jordania",a:"Argelia",k:"2026-06-22T22:00:00-06:00"},
  // Jun 23
  {g:"K",h:"Portugal",a:"Uzbekistán",k:"2026-06-23T12:00:00-06:00"},
  {g:"L",h:"Inglaterra",a:"Ghana",k:"2026-06-23T15:00:00-06:00"},
  {g:"L",h:"Panamá",a:"Croacia",k:"2026-06-23T18:00:00-06:00"},
  {g:"K",h:"Colombia",a:"RD Congo",k:"2026-06-23T21:00:00-06:00"},
  // Jun 24
  {g:"B",h:"Suiza",a:"Canadá",k:"2026-06-24T14:00:00-06:00"},
  {g:"B",h:"Bosnia y Herz.",a:"Qatar",k:"2026-06-24T14:00:00-06:00"},
  {g:"C",h:"Brasil",a:"Escocia",k:"2026-06-24T17:00:00-06:00"},
  {g:"C",h:"Marruecos",a:"Haití",k:"2026-06-24T17:00:00-06:00"},
  {g:"A",h:"México",a:"Chequia",k:"2026-06-24T20:00:00-06:00"},
  {g:"A",h:"Corea del Sur",a:"Sudáfrica",k:"2026-06-24T20:00:00-06:00"},
  // Jun 25
  {g:"E",h:"Ecuador",a:"Alemania",k:"2026-06-25T15:00:00-06:00"},
  {g:"E",h:"Curazao",a:"Costa de Marfil",k:"2026-06-25T15:00:00-06:00"},
  {g:"F",h:"Túnez",a:"Países Bajos",k:"2026-06-25T18:00:00-06:00"},
  {g:"F",h:"Japón",a:"Suecia",k:"2026-06-25T18:00:00-06:00"},
  {g:"D",h:"Estados Unidos",a:"Turquía",k:"2026-06-25T21:00:00-06:00"},
  {g:"D",h:"Paraguay",a:"Australia",k:"2026-06-25T21:00:00-06:00"},
  // Jun 26
  {g:"I",h:"Noruega",a:"Francia",k:"2026-06-26T14:00:00-06:00"},
  {g:"I",h:"Senegal",a:"Irak",k:"2026-06-26T14:00:00-06:00"},
  {g:"H",h:"Uruguay",a:"España",k:"2026-06-26T17:00:00-06:00"},
  {g:"H",h:"Cabo Verde",a:"Arabia Saudita",k:"2026-06-26T17:00:00-06:00"},
  {g:"G",h:"Bélgica",a:"Nueva Zelanda",k:"2026-06-26T20:00:00-06:00"},
  {g:"G",h:"Egipto",a:"Irán",k:"2026-06-26T20:00:00-06:00"},
  // Jun 27
  {g:"J",h:"Argentina",a:"Jordania",k:"2026-06-27T14:00:00-06:00"},
  {g:"J",h:"Argelia",a:"Austria",k:"2026-06-27T14:00:00-06:00"},
  {g:"K",h:"Portugal",a:"Colombia",k:"2026-06-27T17:00:00-06:00"},
  {g:"K",h:"RD Congo",a:"Uzbekistán",k:"2026-06-27T17:00:00-06:00"},
  {g:"L",h:"Inglaterra",a:"Panamá",k:"2026-06-27T20:00:00-06:00"},
  {g:"L",h:"Croacia",a:"Ghana",k:"2026-06-27T20:00:00-06:00"},
];

const generateGroupMatches = () => {
  return GROUP_MATCHES_DATA.map((d,i)=>({
    id:`G${String(i+1).padStart(3,"0")}`,
    phase:"grupos",
    group:d.g,
    home:d.h,
    away:d.a,
    homeScore:null,
    awayScore:null,
    kickoff:new Date(d.k).toISOString(),
    locked:false,
  }));
};"""

print("Fix matches:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
