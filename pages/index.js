import { supabase } from '../lib/supabaseClient'
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/router";
import { Lock, Unlock, Download, Upload, Trash2, Edit3, Award, Globe, Share2, Menu, X, Zap, Plus, Settings, Trophy } from "lucide-react";

// ── i18n ──────────────────────────────────────────────────────
const T = {
  es: {
    appName:"La Doce · Quiniela", appSub:"Social.Roof.Bar · Mundial 2026",
    nav:{ home:"Inicio", predictions:"Pronósticos", results:"Resultados", leaderboard:"Tabla", admin:"Admin" },
    home:{ subtitle:"11 Jun – 19 Jul · EUA, México y Canadá · 48 equipos · 104 partidos", participants:"Participantes", totalPot:"Pozo total", matchesLoaded:"Partidos jugados", poolsTitle:"Pozos por fase", paid:"pagados", howTitle:"Cómo funciona", how1:"Entra a una o varias fases pagando la entrada correspondiente.", how2:"También puedes unirte al pozo del torneo completo (104 partidos).", how3pts:"pts marcador exacto ·", how3win:"pt ganador correcto · Eliminatorias ×", how4:"El admin captura resultados y bloquea partidos antes del kickoff.", distLabel:"Reparto:" },
    pred:{ whoAreYou:"¿Quién eres?", selectName:"Selecciona tu nombre para capturar pronósticos.", noParticipants:"No hay participantes aún. El admin debe agregarlos.", change:"Cambiar", notPaid:"No has pagado esta fase. Tus pronósticos se guardan pero no cuentan hasta que el admin confirme tu pago.", locked:"Bloqueado" },
    results:{ title:"Resultados oficiales", readOnly:"Solo lectura — entra como admin para editar", lockAll:"Bloquear toda la fase", pending:"Pendiente", live:"En vivo", finished:"Terminado" },
    lb:{ title:"Clasificación", pot:"Pozo acumulado", pts:"pts", hits:"aciertos", noPaid:"Sin participantes pagados en esta fase.", tieNote:"Desempate: puntos → aciertos → marcadores exactos en eliminatorias" },
    admin:{ title:"Panel admin", logout:"Cerrar sesión", pinTitle:"Acceso administrador", pinSub:"Ingresa el PIN para gestionar la quiniela.", pinDefault:"PIN inicial: 1234", enter:"Entrar", wrong:"PIN incorrecto", participantsTitle:"Participantes y pagos", addName:"Nombre del participante", add:"Agregar", poolsTitle:"Configuración de pozos", entryFee:"Entrada (MXN)", distribution:"Reparto % (ej: 70,20,10)", sumWarning:"⚠ debe sumar 100", rulesTitle:"Reglas de puntaje", exactPts:"Pts marcador exacto", winnerPts:"Pts ganador correcto", knockoutMult:"Multiplicador eliminatorias", adminPin:"PIN admin", dataTitle:"Datos", export:"Exportar backup", importBtn:"Importar backup", resetBtn:"Borrar todo", resetConfirm:"¿Borrar TODO y empezar de cero? Esto no se puede deshacer." },
    wa:{ msg:"🏆 La Doce · Quiniela Mundial 2026\n📊 Clasificación actual:\n\n" },
    phases:{ grupos:"Fase de Grupos", r32:"Ronda de 32", r16:"Octavos", cuartos:"Cuartos", semis:"Semifinales", final:"Final", torneo:"Torneo Completo" },
    months:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
  },
  en: {
    appName:"La Doce · Pool", appSub:"Social.Roof.Bar · World Cup 2026",
    nav:{ home:"Home", predictions:"Picks", results:"Results", leaderboard:"Table", admin:"Admin" },
    home:{ subtitle:"Jun 11 – Jul 19 · USA, Mexico, Canada · 48 teams · 104 matches", participants:"Participants", totalPot:"Total pot", matchesLoaded:"Matches played", poolsTitle:"Phase pools", paid:"paid", howTitle:"How it works", how1:"Join one or more phases by paying the entry fee.", how2:"You can also join the full tournament pool (all 104 matches).", how3pts:"pts exact score ·", how3win:"pt correct winner · Knockouts ×", how4:"Admin enters official results and locks matches before kickoff.", distLabel:"Split:" },
    pred:{ whoAreYou:"Who are you?", selectName:"Select your name to enter picks.", noParticipants:"No participants yet. Admin must add them.", change:"Change", notPaid:"You haven't paid for this phase. Your picks are saved but won't count until admin confirms payment.", locked:"Locked" },
    results:{ title:"Official results", readOnly:"Read only — log in as admin to edit", lockAll:"Lock entire phase", pending:"Pending", live:"Live", finished:"Finished" },
    lb:{ title:"Standings", pot:"Total pot", pts:"pts", hits:"hits", noPaid:"No paid participants in this phase.", tieNote:"Tiebreaker: points → hits → exact scores in knockouts" },
    admin:{ title:"Admin panel", logout:"Log out", pinTitle:"Admin access", pinSub:"Enter PIN to manage the pool.", pinDefault:"Default PIN: 1234", enter:"Enter", wrong:"Wrong PIN", participantsTitle:"Participants & payments", addName:"Participant name", add:"Add", poolsTitle:"Pool configuration", entryFee:"Entry fee (MXN)", distribution:"Split % (e.g. 70,20,10)", sumWarning:"⚠ must add up to 100", rulesTitle:"Scoring rules", exactPts:"Pts exact score", winnerPts:"Pts correct winner", knockoutMult:"Knockout multiplier", adminPin:"Admin PIN", dataTitle:"Data", export:"Export backup", importBtn:"Import backup", resetBtn:"Reset all", resetConfirm:"Delete EVERYTHING and start over? This cannot be undone." },
    wa:{ msg:"🏆 La Doce · World Cup Pool 2026\n📊 Current standings:\n\n" },
    phases:{ grupos:"Group Stage", r32:"Round of 32", r16:"Round of 16", cuartos:"Quarters", semis:"Semis", final:"Final", torneo:"Full Tournament" },
    months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

// ── DATOS ─────────────────────────────────────────────────────
const GROUPS_2026 = {
  A:["México","Sudáfrica","Corea del Sur","Chequia"],
  B:["Canadá","Bosnia y Herz.","Qatar","Suiza"],
  C:["Brasil","Marruecos","Haití","Escocia"],
  D:["Estados Unidos","Paraguay","Australia","Turquía"],
  E:["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F:["Países Bajos","Japón","Suecia","Túnez"],
  G:["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H:["España","Cabo Verde","Arabia Saudita","Uruguay"],
  I:["Francia","Senegal","Irak","Noruega"],
  J:["Argentina","Argelia","Austria","Jordania"],
  K:["Portugal","RD Congo","Uzbekistán","Colombia"],
  L:["Inglaterra","Croacia","Ghana","Panamá"],
};

// Partidos reales con fechas/horarios oficiales (horario CDMX UTC-6, offset -05:00 para ISO correcto)
// Fuente: Fox Sports / FIFA oficial
const GROUP_MATCHES_DATA = [
  // Jun 11
  {g:"A",h:"México",a:"Sudáfrica",k:"2026-06-11T14:00:00-05:00"},
  {g:"A",h:"Corea del Sur",a:"Chequia",k:"2026-06-11T21:00:00-05:00"},
  // Jun 12
  {g:"B",h:"Canadá",a:"Bosnia y Herz.",k:"2026-06-12T14:00:00-05:00"},
  {g:"D",h:"Estados Unidos",a:"Paraguay",k:"2026-06-12T20:00:00-05:00"},
  // Jun 13
  {g:"B",h:"Qatar",a:"Suiza",k:"2026-06-13T14:00:00-05:00"},
  {g:"C",h:"Brasil",a:"Marruecos",k:"2026-06-13T17:00:00-05:00"},
  {g:"C",h:"Haití",a:"Escocia",k:"2026-06-13T20:00:00-05:00"},
  {g:"D",h:"Australia",a:"Turquía",k:"2026-06-13T23:00:00-05:00"},
  // Jun 14
  {g:"E",h:"Alemania",a:"Curazao",k:"2026-06-14T12:00:00-05:00"},
  {g:"F",h:"Países Bajos",a:"Japón",k:"2026-06-14T15:00:00-05:00"},
  {g:"E",h:"Costa de Marfil",a:"Ecuador",k:"2026-06-14T18:00:00-05:00"},
  {g:"F",h:"Túnez",a:"Suecia",k:"2026-06-14T21:00:00-05:00"},
  // Jun 15
  {g:"H",h:"España",a:"Cabo Verde",k:"2026-06-15T11:00:00-05:00"},
  {g:"G",h:"Bélgica",a:"Egipto",k:"2026-06-15T14:00:00-05:00"},
  {g:"H",h:"Arabia Saudita",a:"Uruguay",k:"2026-06-15T17:00:00-05:00"},
  {g:"G",h:"Irán",a:"Nueva Zelanda",k:"2026-06-15T20:00:00-05:00"},
  // Jun 16
  {g:"I",h:"Francia",a:"Senegal",k:"2026-06-16T14:00:00-05:00"},
  {g:"I",h:"Irak",a:"Noruega",k:"2026-06-16T17:00:00-05:00"},
  {g:"J",h:"Argentina",a:"Argelia",k:"2026-06-16T20:00:00-05:00"},
  {g:"J",h:"Austria",a:"Jordania",k:"2026-06-16T23:00:00-05:00"},
  // Jun 17
  {g:"K",h:"Portugal",a:"RD Congo",k:"2026-06-17T12:00:00-05:00"},
  {g:"L",h:"Inglaterra",a:"Croacia",k:"2026-06-17T15:00:00-05:00"},
  {g:"L",h:"Ghana",a:"Panamá",k:"2026-06-17T18:00:00-05:00"},
  {g:"K",h:"Uzbekistán",a:"Colombia",k:"2026-06-17T21:00:00-05:00"},
  // Jun 18
  {g:"A",h:"Chequia",a:"Sudáfrica",k:"2026-06-18T11:00:00-05:00"},
  {g:"B",h:"Suiza",a:"Bosnia y Herz.",k:"2026-06-18T14:00:00-05:00"},
  {g:"B",h:"Canadá",a:"Qatar",k:"2026-06-18T17:00:00-05:00"},
  {g:"A",h:"México",a:"Corea del Sur",k:"2026-06-18T20:00:00-05:00"},
  // Jun 19
  {g:"D",h:"Estados Unidos",a:"Australia",k:"2026-06-19T14:00:00-05:00"},
  {g:"C",h:"Escocia",a:"Marruecos",k:"2026-06-19T14:00:00-05:00"},
  {g:"C",h:"Brasil",a:"Haití",k:"2026-06-19T20:00:00-05:00"},
  {g:"D",h:"Turquía",a:"Paraguay",k:"2026-06-19T23:00:00-05:00"},
  // Jun 20
  {g:"F",h:"Países Bajos",a:"Suecia",k:"2026-06-20T12:00:00-05:00"},
  {g:"E",h:"Alemania",a:"Costa de Marfil",k:"2026-06-20T15:00:00-05:00"},
  {g:"E",h:"Ecuador",a:"Curazao",k:"2026-06-20T19:00:00-05:00"},
  {g:"F",h:"Túnez",a:"Japón",k:"2026-06-20T23:00:00-05:00"},
  // Jun 21
  {g:"H",h:"España",a:"Arabia Saudita",k:"2026-06-21T11:00:00-05:00"},
  {g:"G",h:"Bélgica",a:"Irán",k:"2026-06-21T14:00:00-05:00"},
  {g:"H",h:"Uruguay",a:"Cabo Verde",k:"2026-06-21T17:00:00-05:00"},
  {g:"G",h:"Nueva Zelanda",a:"Egipto",k:"2026-06-21T20:00:00-05:00"},
  // Jun 22
  {g:"J",h:"Argentina",a:"Austria",k:"2026-06-22T12:00:00-05:00"},
  {g:"I",h:"Francia",a:"Irak",k:"2026-06-22T16:00:00-05:00"},
  {g:"I",h:"Noruega",a:"Senegal",k:"2026-06-22T19:00:00-05:00"},
  {g:"J",h:"Jordania",a:"Argelia",k:"2026-06-22T22:00:00-05:00"},
  // Jun 23
  {g:"K",h:"Portugal",a:"Uzbekistán",k:"2026-06-23T12:00:00-05:00"},
  {g:"L",h:"Inglaterra",a:"Ghana",k:"2026-06-23T15:00:00-05:00"},
  {g:"L",h:"Panamá",a:"Croacia",k:"2026-06-23T18:00:00-05:00"},
  {g:"K",h:"Colombia",a:"RD Congo",k:"2026-06-23T21:00:00-05:00"},
  // Jun 24
  {g:"B",h:"Suiza",a:"Canadá",k:"2026-06-24T14:00:00-05:00"},
  {g:"B",h:"Bosnia y Herz.",a:"Qatar",k:"2026-06-24T14:00:00-05:00"},
  {g:"C",h:"Brasil",a:"Escocia",k:"2026-06-24T17:00:00-05:00"},
  {g:"C",h:"Marruecos",a:"Haití",k:"2026-06-24T17:00:00-05:00"},
  {g:"A",h:"México",a:"Chequia",k:"2026-06-24T20:00:00-05:00"},
  {g:"A",h:"Corea del Sur",a:"Sudáfrica",k:"2026-06-24T20:00:00-05:00"},
  // Jun 25
  {g:"E",h:"Ecuador",a:"Alemania",k:"2026-06-25T15:00:00-05:00"},
  {g:"E",h:"Curazao",a:"Costa de Marfil",k:"2026-06-25T15:00:00-05:00"},
  {g:"F",h:"Túnez",a:"Países Bajos",k:"2026-06-25T18:00:00-05:00"},
  {g:"F",h:"Japón",a:"Suecia",k:"2026-06-25T18:00:00-05:00"},
  {g:"D",h:"Estados Unidos",a:"Turquía",k:"2026-06-25T21:00:00-05:00"},
  {g:"D",h:"Paraguay",a:"Australia",k:"2026-06-25T21:00:00-05:00"},
  // Jun 26
  {g:"I",h:"Noruega",a:"Francia",k:"2026-06-26T14:00:00-05:00"},
  {g:"I",h:"Senegal",a:"Irak",k:"2026-06-26T14:00:00-05:00"},
  {g:"H",h:"Uruguay",a:"España",k:"2026-06-26T17:00:00-05:00"},
  {g:"H",h:"Cabo Verde",a:"Arabia Saudita",k:"2026-06-26T17:00:00-05:00"},
  {g:"G",h:"Bélgica",a:"Nueva Zelanda",k:"2026-06-26T20:00:00-05:00"},
  {g:"G",h:"Egipto",a:"Irán",k:"2026-06-26T20:00:00-05:00"},
  // Jun 27
  {g:"J",h:"Argentina",a:"Jordania",k:"2026-06-27T14:00:00-05:00"},
  {g:"J",h:"Argelia",a:"Austria",k:"2026-06-27T14:00:00-05:00"},
  {g:"K",h:"Portugal",a:"Colombia",k:"2026-06-27T17:00:00-05:00"},
  {g:"K",h:"RD Congo",a:"Uzbekistán",k:"2026-06-27T17:00:00-05:00"},
  {g:"L",h:"Inglaterra",a:"Panamá",k:"2026-06-27T20:00:00-05:00"},
  {g:"L",h:"Croacia",a:"Ghana",k:"2026-06-27T20:00:00-05:00"},
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
};

const generateKnockouts = () => {
  const defs=[{phase:"r32",count:16,start:"2026-07-01T19:00:00-05:00"},{phase:"r16",count:8,start:"2026-07-05T19:00:00-05:00"},{phase:"cuartos",count:4,start:"2026-07-10T19:00:00-05:00"},{phase:"semis",count:2,start:"2026-07-14T19:00:00-05:00"},{phase:"final",count:1,start:"2026-07-19T17:00:00-05:00"}];
  const m=[];
  defs.forEach(({phase,count,start})=>{
    for(let i=1;i<=count;i++){
      m.push({id:`${phase.toUpperCase()}-${String(i).padStart(2,"0")}`,phase,group:null,home:"",away:"",homeScore:null,awayScore:null,kickoff:new Date(new Date(start).getTime()+(i-1)*43200000).toISOString(),locked:false});
    }
  });
  return m;
};

const PHASES=[{key:"grupos"},{key:"r32"},{key:"r16"},{key:"cuartos"},{key:"semis"},{key:"final"}];


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
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace("Estados Unidos","us")
    .replace("Canada","ca");
  const code = FLAGS[normalized] || FLAGS[team];
  return code ? "https://flagcdn.com/w160/" + code + ".png" : null;
};

const DEFAULT={
  config:{adminPin:"1234",pointsExact:3,pointsWinner:1,knockoutMultiplier:2},
  pools:{
    grupos:{entryFee:100,prizes:[1000,500,0]},r32:{entryFee:100,prizes:[1000,500,0]},
    r16:{entryFee:100,prizes:[1000,500,0]},cuartos:{entryFee:150,prizes:[1500,750,0]},
    semis:{entryFee:200,prizes:[2000,1000,0]},final:{entryFee:300,prizes:[3000,0,0]},
    torneo:{entryFee:500,prizes:[5000,2500,1000]},
  },
  participants:[],
  matches:[...generateGroupMatches(),...generateKnockouts()],
  predictions:{},
};

// ── UTILS ──────────────────────────────────────────────────────
const SK="ld-quiniela-2026-v1";
const load=async()=>{
  try{
    const{data}=await supabase.from('config').select('value').eq('key',SK).single();
    return data?data.value:null;
  }catch{ return null; }
};
const save=async(s)=>{
  try{
    await supabase.from('config').upsert({key:SK,value:s},{onConflict:'key'});
  }catch{}
};
const mxn=(n)=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0}).format(Math.round(n||0));
const pts=(pred,m,cfg)=>{
  if(!pred||m.homeScore===null||m.awayScore===null) return 0;
  const ph=parseInt(pred.home),pa=parseInt(pred.away);
  if(isNaN(ph)||isNaN(pa)) return 0;
  const mult=m.phase==="grupos"?1:cfg.knockoutMultiplier;
  if(ph===m.homeScore&&pa===m.awayScore) return cfg.pointsExact*mult;
  const pw=ph>pa?"H":ph<pa?"A":"D",aw=m.homeScore>m.awayScore?"H":m.homeScore<m.awayScore?"A":"D";
  return pw===aw?cfg.pointsWinner*mult:0;
};
const status=(k)=>{ const n=Date.now(),t=new Date(k).getTime(); return n<t?"pending":n<t+7200000?"live":"finished"; };
const fmtD=(iso,lang)=>{ const mo=T[lang].months; const d=new Date(new Date(iso).toLocaleString("en-US",{timeZone:"America/Mexico_City"})); return `${d.getDate()} ${mo[d.getMonth()]} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

// ── SVG LOGO (arco concéntrico estilo La Doce) ────────────────
const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 60 72" fill="none">
    {/* Arcos concéntricos */}
    <path d="M30 6 C14 6 4 18 4 32 L4 50" stroke="#5BB8A8" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M30 6 C46 6 56 18 56 32 L56 50" stroke="#5BB8A8" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M30 14 C18 14 11 23 11 34 L11 50" stroke="#5BB8A8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
    <path d="M30 14 C42 14 49 23 49 34 L49 50" stroke="#5BB8A8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
    <path d="M30 22 C22 22 18 29 18 36 L18 50" stroke="#5BB8A8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55"/>
    <path d="M30 22 C38 22 42 29 42 36 L42 50" stroke="#5BB8A8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55"/>
    {/* Línea vertical central */}
    <line x1="30" y1="6" x2="30" y2="50" stroke="#5BB8A8" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
    {/* Base rectangular */}
    <rect x="18" y="50" width="24" height="14" rx="2" stroke="#C8A96A" strokeWidth="2.5" fill="none"/>
    <line x1="26" y1="50" x2="26" y2="64" stroke="#C8A96A" strokeWidth="1.5" opacity="0.6"/>
    <line x1="34" y1="50" x2="34" y2="64" stroke="#C8A96A" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --teal:#5BB8A8;--teal-l:#7DCFC2;--teal-d:rgba(91,184,168,0.12);--teal-b:rgba(91,184,168,0.22);
  --sand:#C8A96A;--sand-l:#E0C98A;--sand-d:rgba(200,169,106,0.12);--sand-b:rgba(200,169,106,0.22);
  --bg:#09090C;--bg2:#101014;--bg3:#16161B;--bg4:#1E1E25;
  --bdr:rgba(91,184,168,0.18);--bdr2:rgba(255,255,255,0.07);--bdrS:rgba(200,169,106,0.2);
  --tx:#EDE9E0;--tx2:#8A8680;--tx3:#4E4B47;
  --green:#52C48A;--green-d:rgba(82,196,138,0.12);
  --amber:#E8A230;--amber-d:rgba(232,162,48,0.12);
  --red:#D95F5F;--red-d:rgba(217,95,95,0.1);
  --r:10px;--rl:16px;
  --fd:'Cormorant Garamond',Georgia,serif;--fb:'DM Sans',system-ui,sans-serif;
  --ease:0.18s cubic-bezier(.4,0,.2,1);
}
html,body{background:var(--bg);color:var(--tx);font-family:var(--fb);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
input,select{background:var(--bg3);border:0.5px solid var(--bdr2);border-radius:var(--r);color:var(--tx);font-family:var(--fb);font-size:14px;padding:9px 12px;outline:none;transition:border-color var(--ease);width:100%}
input:focus{border-color:var(--teal)}
input[type=number]{-moz-appearance:textfield}
input[type=number]::-webkit-inner-spin-button{display:none}
input[type=checkbox]{width:16px;height:16px;accent-color:var(--teal);cursor:pointer}
button{background:transparent;border:0.5px solid var(--bdr2);border-radius:var(--r);color:var(--tx2);cursor:pointer;font-family:var(--fb);font-size:13px;padding:8px 14px;transition:all var(--ease);display:inline-flex;align-items:center;gap:5px;letter-spacing:.01em}
button:hover{background:var(--teal-d);border-color:var(--teal-b);color:var(--teal-l)}
button.primary{background:var(--teal);border-color:var(--teal);color:#09090C;font-weight:500}
button.primary:hover{background:var(--teal-l);border-color:var(--teal-l)}
button.sand{background:var(--sand-d);border-color:var(--sand-b);color:var(--sand-l)}
button.sand:hover{background:rgba(200,169,106,0.2);border-color:var(--sand)}
button.ghost{border-color:transparent;color:var(--tx3)}
button.ghost:hover{background:var(--bg3);border-color:var(--bdr2);color:var(--tx2)}
button.danger{border-color:transparent;color:var(--red)}
button.danger:hover{background:var(--red-d);border-color:var(--red)}
table{border-collapse:collapse;width:100%}
th{font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.09em;padding:9px 6px;text-align:center;border-bottom:0.5px solid var(--bdr2);font-weight:500}
th:first-child{text-align:left}
td{padding:8px 6px;font-size:12px;text-align:center;border-bottom:0.5px solid rgba(255,255,255,0.03);color:var(--tx)}
td:first-child{text-align:left;font-size:13px}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--teal-b);border-radius:2px}
@keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
.fade{animation:fadeIn .28s ease both}
.pulse{animation:pulse 1.6s infinite}

/* Header desierto gradient */
.hero-bg{
  background: linear-gradient(180deg,
    rgba(91,184,168,0.06) 0%,
    rgba(200,169,106,0.04) 50%,
    transparent 100%
  );
  border-bottom:0.5px solid rgba(91,184,168,0.1);
}

.card{background:var(--bg2);border:0.5px solid var(--bdr2);border-radius:var(--rl);padding:1.25rem}
.card-teal{border-color:var(--bdr)}
.card-sand{border-color:var(--bdrS)}

/* Phase tabs */
.ptab{padding:5px 13px;border-radius:20px;font-size:11px;border:0.5px solid var(--bdr2);background:transparent;color:var(--tx3);cursor:pointer;white-space:nowrap;transition:all var(--ease);letter-spacing:.02em}
.ptab.on{background:var(--teal-d);border-color:var(--teal-b);color:var(--teal)}
.ptab.on-sand{background:var(--sand-d);border-color:var(--sand-b);color:var(--sand)}

/* Match row */
.mrow{display:grid;grid-template-columns:52px 1fr 96px 1fr 26px;gap:8px;align-items:center;padding:10px 14px;background:var(--bg2);border:0.5px solid var(--bdr2);border-radius:var(--r);transition:border-color var(--ease)}
.mrow:hover{border-color:var(--bdr)}
.mrow.lk{opacity:.5}

/* Score input */
.si{width:38px!important;text-align:center;padding:6px 2px;font-size:16px;font-weight:500;border-radius:6px;background:var(--bg3);border:0.5px solid var(--bdr2)}
.si:focus{border-color:var(--teal)}

/* Badges */
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:500;letter-spacing:.04em}
.bl{background:var(--amber-d);color:var(--amber)}
.bf{background:var(--green-d);color:var(--green)}
.bp{background:var(--bg4);color:var(--tx3)}
.dot{width:5px;height:5px;border-radius:50%;background:var(--amber)}

/* Leaderboard rank colors */
.r1{color:var(--sand)}
.r2{color:#B8B8B8}
.r3{color:#A07040}

/* Toast */
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--bg3);border:0.5px solid var(--teal-b);border-radius:var(--r);padding:9px 20px;font-size:13px;color:var(--teal-l);z-index:999;white-space:nowrap;animation:fadeIn .2s ease;box-shadow:0 8px 32px rgba(0,0,0,.5)}

/* Decorative top line */
.gold-line{height:2px;background:linear-gradient(90deg,transparent 0%,var(--teal) 20%,var(--sand) 60%,transparent 100%)}
`;

// ── APP ───────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
// COMPONENTES EXTERNOS — fuera de App para evitar re-renders
// ═══════════════════════════════════════════════════════════

function Home({state,urlParticipant,pots,totalPot,boards,t,lang}) {
    const now = Date.now();
    const part = urlParticipant ? state.participants.find(p=>p.id===urlParticipant) : null;
    const generalKey=[...PHASES.map(p=>p.key),"torneo"].reduce((best,k)=>(boards[k]||[]).length>(boards[best]||[]).length?k:best,"grupos");

    const upcoming = state.matches
      .filter(m=>m.home&&m.away&&new Date(m.kickoff).getTime()>now-7200000)
      .sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));

    const next2 = upcoming.slice(0,2);
    const next4 = upcoming.slice(0,4);

    const live = state.matches.filter(m=>{
      const k=new Date(m.kickoff).getTime();
      return now>=k&&now<=k+7200000&&m.home&&m.away;
    });

    const myPoints = part ? (() => {
      let total=0;
      state.matches.forEach(m=>{
        const pred=(state.predictions[urlParticipant]||{})[m.id];
        if(pred) total+=pts(pred,m,state.config);
      });
      return total;
    })() : 0;

    const pendingPreds = part ? state.matches.filter(m=>{
      const k=new Date(m.kickoff).getTime();
      const pred=(state.predictions[urlParticipant]||{})[m.id];
      return m.home&&m.away&&k>now&&(!pred||pred.home===""||pred.away==="");
    }).length : 0;

    const countdown=(iso)=>{
      const diff=new Date(iso).getTime()-now;
      if(diff<=0) return "En curso";
      const h=Math.floor(diff/3600000);
      const m=Math.floor((diff%3600000)/60000);
      if(h>48) return Math.floor(h/24)+"d "+h%24+"h";
      if(h>0) return h+"h "+m+"m";
      return m+"m";
    };

    const stBadge=(m)=>{
      const k=new Date(m.kickoff).getTime();
      if(now>=k&&now<=k+7200000) return {label:"En vivo",bg:"var(--amber-d)",color:"var(--amber)",dot:true};
      if(m.homeScore!==null) return {label:"Terminado",bg:"var(--green-d)",color:"var(--green)",dot:false};
      return {label:fmtD(m.kickoff,lang),bg:"var(--bg4)",color:"var(--tx3)",dot:false};
    };

    const MatchCard=({m,size="sm"})=>{
      const st=stBadge(m);
      const diff=new Date(m.kickoff).getTime()-now;
      const urgent=diff<3600000&&diff>0;
      const hUrl=flagUrl(m.home), aUrl=flagUrl(m.away);
      return(
        <div style={{position:"relative",overflow:"hidden",padding:size==="lg"?"14px":"10px 12px",background:urgent?"rgba(200,169,106,0.06)":"var(--bg2)",border:`0.5px solid ${urgent?"var(--bdrS)":"var(--bdr2)"}`,borderRadius:"var(--r)",marginBottom:5}}>
          <div style={{position:"absolute",inset:0,display:"flex",pointerEvents:"none"}}>
            {hUrl&&<div style={{flex:1,backgroundImage:`url(${hUrl})`,backgroundSize:"cover",backgroundPosition:"center right",opacity:0.07}}/>}
            {aUrl&&<div style={{flex:1,backgroundImage:`url(${aUrl})`,backgroundSize:"cover",backgroundPosition:"center left",opacity:0.07}}/>}
          </div>
          <div style={{position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:"9px",color:"var(--tx3)"}}>{m.group?"Grupo "+m.group:m.phase?.toUpperCase()}</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {diff>0&&diff<3600000&&(
                  <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:"9px",background:"rgba(217,95,95,0.15)",color:"var(--red)",fontWeight:500}}>
                    Cierra pronto
                  </span>
                )}
                <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:"9px",background:st.bg,color:st.color}}>
                  {st.dot&&<span style={{width:4,height:4,borderRadius:"50%",background:st.color,display:"inline-block",animation:"pulse 1.5s infinite"}}/>}
                  {st.label}
                </span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:size==="lg"?"15px":"13px",fontWeight:500}}>{m.home}</div>
              </div>
              <div style={{textAlign:"center",minWidth:50}}>
                {m.homeScore!==null
                  ? <div style={{display:"flex",gap:4,alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:"20px",fontWeight:700,color:"var(--tx)"}}>{m.homeScore}</span>
                      <span style={{fontSize:"12px",color:"var(--tx3)"}}>:</span>
                      <span style={{fontSize:"20px",fontWeight:700,color:"var(--tx)"}}>{m.awayScore}</span>
                    </div>
                  : diff>0
                    ? <div style={{fontSize:"12px",fontWeight:500,color:"var(--teal)"}}>{countdown(m.kickoff)}</div>
                    : <div style={{fontSize:"13px",color:"var(--tx3)"}}>vs</div>
                }
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:size==="lg"?"15px":"13px",fontWeight:500}}>{m.away}</div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return(
    <div className="fade">
      <div className="hero-bg" style={{textAlign:"center",padding:"2rem 1rem 1.5rem"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
          <LogoMark size={44}/>
        </div>
        <div style={{fontFamily:"var(--fd)",fontSize:"clamp(11px,3vw,13px)",color:"var(--teal)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:4}}>La Doce · Social.Roof.Bar</div>
        <div style={{fontFamily:"var(--fd)",fontSize:"clamp(22px,6vw,34px)",fontWeight:500,lineHeight:1.15,marginBottom:6}}>
          <span style={{color:"var(--tx)"}}>Quiniela </span>
          <span style={{color:"var(--sand)"}}>Mundial 2026</span>
        </div>
        <div style={{fontSize:"11px",color:"var(--tx3)",letterSpacing:".04em"}}>{t.home.subtitle}</div>
      </div>

      <div style={{padding:"1.2rem 1rem"}}>

        {part&&(
          <div style={{background:"linear-gradient(135deg,rgba(91,184,168,0.08),rgba(200,169,106,0.06))",border:"0.5px solid var(--bdr)",borderRadius:"var(--rl)",padding:"1rem 1.2rem",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:"10px",color:"var(--tx3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:2}}>Bienvenido</div>
              <div style={{fontFamily:"var(--fd)",fontSize:"20px",fontWeight:500,color:"var(--tx)"}}>{part.name}</div>
            </div>
            <div style={{display:"flex",gap:12}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"22px",fontWeight:500,color:"var(--teal)"}}>{myPoints}</div>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>pts</div>
              </div>
              {pendingPreds>0&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"22px",fontWeight:500,color:"var(--sand)"}}>{pendingPreds}</div>
                  <div style={{fontSize:"9px",color:"var(--tx3)"}}>pendientes</div>
                </div>
              )}
            </div>
          </div>
        )}

        {live.length>0&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--amber)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--amber)",display:"inline-block",animation:"pulse 1.5s infinite"}}/>
              En vivo ahora
            </div>
            {live.map(m=><MatchCard key={m.id} m={m} size="lg"/>)}
          </div>
        )}

        {next2.length>0&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Proximos partidos</div>
            {next2.map(m=><MatchCard key={m.id} m={m} size="lg"/>)}
          </div>
        )}

        {next4.length>2&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Agenda</div>
            {next4.slice(2).map(m=><MatchCard key={m.id} m={m} size="sm"/>)}
          </div>
        )}

        {state.matches.some(m=>m.homeScore!==null)&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Clasificacion general</div>
            <div style={{display:"grid",gap:3}}>
              {(boards[generalKey]||[]).slice(0,10).map((row,idx)=>{
                const cl=["var(--sand)","#B8B8B8","#A07040"][idx]||"var(--tx2)";
                const isMe=row.id===urlParticipant;
                return(
                  <div key={row.id} style={{display:"grid",gridTemplateColumns:"26px 1fr auto auto",gap:8,alignItems:"center",padding:"8px 12px",background:isMe?"rgba(91,184,168,0.07)":idx<3?"rgba(200,169,106,0.04)":"var(--bg2)",border:`0.5px solid ${isMe?"var(--bdr)":idx<3?"var(--bdrS)":"var(--bdr2)"}`,borderRadius:"var(--r)"}}>
                    <span style={{fontSize:"13px",fontWeight:500,color:cl}}>{idx+1}</span>
                    <span style={{fontSize:"13px",fontWeight:isMe?500:400,color:isMe?"var(--teal)":"var(--tx)"}}>{row.name}{isMe?" (tu)":""}</span>
                    <span style={{fontSize:"10px",color:"var(--tx3)"}}>{row.hits} ac.</span>
                    <span style={{fontSize:"13px",fontWeight:500}}>{row.score}<span style={{fontSize:"9px",color:"var(--tx3)"}}> pts</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {urlParticipant&&state.matches.some(m=>m.homeScore!==null)&&(
          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase"}}>Mis pronosticos vs resultado</div>
            <div style={{display:"grid",gap:4}}>
              {state.matches
                .filter(m=>m.homeScore!==null&&m.home&&m.away)
                .sort((a,b)=>new Date(b.kickoff)-new Date(a.kickoff))
                .slice(0,10)
                .map(m=>{
                  const pred=(state.predictions[urlParticipant]||{})[m.id];
                  const myPts=pred?pts(pred,m,state.config):0;
                  const correct=myPts>=state.config.pointsExact*(m.phase==="grupos"?1:state.config.knockoutMultiplier);
                  const partial=myPts>0&&!correct;
                  const bg=correct?"rgba(82,196,138,0.06)":partial?"rgba(245,158,11,0.06)":"rgba(217,95,95,0.04)";
                  const borderC=correct?"var(--green)":partial?"var(--amber)":"rgba(217,95,95,0.3)";
                  return(
                    <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"center",padding:"9px 12px",background:bg,border:`0.5px solid ${borderC}`,borderRadius:"var(--r)"}}>
                      <div>
                        <div style={{fontSize:"12px",fontWeight:500}}>{m.home} vs {m.away}</div>
                        <div style={{fontSize:"10px",color:"var(--tx3)",marginTop:2}}>
                          Real: <span style={{color:"var(--tx)",fontWeight:500}}>{m.homeScore}-{m.awayScore}</span>
                          {pred&&<span> · Tu: <span style={{color:"var(--tx)",fontWeight:500}}>{pred.home}-{pred.away}</span></span>}
                          {!pred&&<span style={{color:"var(--tx3)"}}> · Sin pronostico</span>}
                        </div>
                      </div>
                      <div style={{fontSize:"13px",fontWeight:500,color:correct?"var(--green)":partial?"var(--amber)":"var(--red)",textAlign:"right"}}>
                        {myPts>0?"+"+myPts:"0"}<span style={{fontSize:"9px"}}> pts</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        <div style={{textAlign:"center",padding:"16px 10px 8px",borderTop:"0.5px solid rgba(91,184,168,0.08)",marginTop:"1rem"}}>
          <div style={{fontSize:"9px",color:"var(--tx3)",letterSpacing:".06em"}}>Desarrollado para La Doce · Social.Roof.Bar</div>
          <div style={{fontSize:"10px",color:"var(--teal)",fontWeight:500,letterSpacing:".04em",marginTop:"2px"}}>Powered by ForensicBit Solutions</div>
        </div>

      </div>
    </div>
    );
}

function Results({state,phase,setPhase,isAdmin,updM,toggleLock,lockPhase,t,lang}) {
    const ms=state.matches.filter(m=>m.phase===phase).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));
    return(
      <div className="fade" style={{padding:"1.5rem 1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
          <div style={{fontFamily:"var(--fd)",fontSize:"22px",fontWeight:500}}>{t.results.title}</div>
          {!isAdmin&&<span style={{fontSize:"10px",color:"var(--tx3)"}}>{t.results.readOnly}</span>}
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:"1rem",scrollbarWidth:"none"}}>
          {PHASES.map(({key})=>(
            <button key={key} onClick={()=>setPhase(key)} className={`ptab${phase===key?" on":""}`}>{t.phases[key]}</button>
          ))}
        </div>
        {isAdmin&&<button onClick={()=>lockPhase(phase)} style={{marginBottom:"1rem",fontSize:"12px"}}><Lock size={11}/> {t.results.lockAll}</button>}
        <div style={{display:"grid",gap:4}}>
          {ms.map(m=>{
            const st=status(m.kickoff);
            const cols=isAdmin?"56px 1fr 100px 1fr 26px 26px":"56px 1fr 100px 1fr";
            return(
              <div key={m.id} className={`mrow${m.locked?" lk":""}`} style={{gridTemplateColumns:cols}}>
                <div>
                  <div style={{fontSize:"9px",color:"var(--tx3)"}}>{m.group?`G-${m.group}`:m.id}</div>
                  <div style={{marginTop:3}}>
                    <span className={`badge ${st==="live"?"bl":st==="finished"?"bf":"bp"}`}>
                      {st==="live"&&<span className="dot pulse"/>}
                      {t.results[st]}
                    </span>
                  </div>
                </div>
                {isAdmin&&m.phase!=="grupos"
                  ?<input value={m.home} placeholder="Local" onChange={e=>updM(m.id,"home",e.target.value)} style={{fontSize:"12px"}}/>
                  :<span style={{fontSize:"12px",textAlign:"right"}}>{m.home||"—"}</span>
                }
                <div style={{display:"flex",gap:3,alignItems:"center",justifyContent:"center"}}>
                  <input type="number" min="0" max="20" className="si" key={`hs-${m.id}`} defaultValue={m.homeScore??""} disabled={!isAdmin} onBlur={e=>updM(m.id,"homeScore",e.target.value===""?null:parseInt(e.target.value))} style={{width:38}}/>
                  <span style={{color:"var(--tx3)",fontSize:"11px"}}>–</span>
                  <input type="number" min="0" max="20" className="si" key={`as-${m.id}`} defaultValue={m.awayScore??""} disabled={!isAdmin} onBlur={e=>updM(m.id,"awayScore",e.target.value===""?null:parseInt(e.target.value))} style={{width:38}}/>
                </div>
                {isAdmin&&m.phase!=="grupos"
                  ?<input value={m.away} placeholder="Visitante" onChange={e=>updM(m.id,"away",e.target.value)} style={{fontSize:"12px"}}/>
                  :<span style={{fontSize:"12px"}}>{m.away||"—"}</span>
                }
                {isAdmin&&(
                  <button className="ghost" onClick={()=>toggleLock(m.id)} style={{padding:4,minWidth:"auto",border:"none"}} title="toggle lock">
                    {m.locked?<Lock size={12} style={{color:"var(--teal)"}}/>:<Unlock size={12} style={{opacity:.25}}/>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
}

function Leaderboard({state,phase,setPhase,isAdmin,pots,boards,shareWA,t}) {
    const board=boards[phase]||[]; const pool=state.pools[phase]; const pot=pots[phase]||0; const prizes=pool?.prizes||[0,0,0]; const bolsa=Math.max(0,pot-prizes.reduce((a,b)=>a+b,0));
    return(
      <div className="fade" style={{padding:"1.5rem 1rem"}}>
        <div style={{fontFamily:"var(--fd)",fontSize:"22px",fontWeight:500,marginBottom:"1rem"}}>{t.lb.title}</div>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:"1rem",scrollbarWidth:"none"}}>
          {[...PHASES,{key:"torneo"}].map(({key})=>(
            <button key={key} onClick={()=>setPhase(key)} className={`ptab${phase===key?" on":""}`}>{t.phases[key]}</button>
          ))}
        </div>

        {/* Pot card - solo admin */}
        {isAdmin&&(
        <div className="card card-sand" style={{marginBottom:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:"10px",color:"var(--tx3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{t.lb.pot}</div>
              <div style={{fontFamily:"var(--fd)",fontSize:"clamp(24px,5vw,32px)",fontWeight:500,color:"var(--sand)",lineHeight:1.05}}>{mxn(pot)}</div>
            </div>
            <button className="sand" onClick={()=>shareWA(phase)} style={{fontSize:"12px"}}><Share2 size={12}/> WhatsApp</button>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {prizes.map((p,i)=>p>0&&(
              <div key={i} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"6px 13px"}}>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{i+1}°</div>
                <div style={{fontSize:"13px",fontWeight:500,color:"var(--sand-l)"}}>{mxn(p)}</div>
              </div>
            ))}
            {bolsa>0&&(
              <div style={{background:"rgba(91,184,168,0.08)",borderRadius:"var(--r)",padding:"6px 13px",border:"0.5px solid var(--bdr)"}}>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>Bolsa</div>
                <div style={{fontSize:"13px",fontWeight:500,color:"var(--teal)"}}>{mxn(bolsa)}</div>
              </div>
            )}
          </div>
        </div>
        )}

        {board.length===0
          ?<div style={{color:"var(--tx3)",fontSize:"13px"}}>{t.lb.noPaid}</div>
          :<div style={{display:"grid",gap:4}}>
            {board.map((row,idx)=>{
              const cl=["r1","r2","r3"][idx]||"";
              // prizes se usa directamente
              return(
                <div key={row.id} style={{display:"grid",gridTemplateColumns:"30px 1fr auto auto auto",gap:10,alignItems:"center",padding:"11px 14px",background:idx<prizes.filter(p=>p>0).length?"rgba(200,169,106,0.05)":"var(--bg2)",border:`0.5px solid ${idx<prizes.filter(p=>p>0).length?"var(--bdrS)":"var(--bdr2)"}`,borderRadius:"var(--r)"}}>
                  <span className={cl} style={{fontSize:"14px",fontWeight:500}}>{idx+1}</span>
                  <span style={{fontSize:"14px",fontWeight:idx===0?500:400,fontFamily:idx<3?"var(--fd)":"var(--fb)"}}>{row.name}</span>
                  <span style={{fontSize:"10px",color:"var(--tx3)"}}>{row.hits} {t.lb.hits}</span>
                  <span style={{fontSize:"14px",fontWeight:500}}>{row.score} <span style={{fontSize:"10px",color:"var(--tx3)"}}>{t.lb.pts}</span></span>
                  {isAdmin&&prizes[idx]>0?<span style={{fontSize:"12px",color:"var(--sand)",fontWeight:500,textAlign:"right"}}>{mxn(prizes[idx])}</span>:<span/>}
                </div>
              );
            })}
          </div>
        }
        <div style={{marginTop:12,fontSize:"10px",color:"var(--tx3)"}}>{t.lb.tieNote}</div>
      </div>
    );
}

function Admin({state,upd,isAdmin,setAdmin,pin,setPin,tryLogin,addP,removeP,
  togglePay,updM,toggleLock,lockPhase,updPool,exportData,exportCSV,importData,
  pots,toast2,t,lang,PHASES,status,fmtD}) {
  const pinRef = useRef(null);
    if(!isAdmin) return(
      <div className="fade" style={{padding:"2rem 1rem"}}>
        <div style={{fontFamily:"var(--fd)",fontSize:"24px",fontWeight:500,marginBottom:6}}>{t.admin.pinTitle}</div>
        <div style={{fontSize:"13px",color:"var(--tx3)",marginBottom:"1.5rem"}}>{t.admin.pinSub}</div>
        <div style={{display:"flex",gap:8,maxWidth:300}}>
          <input ref={pinRef} type="password" placeholder="PIN" autoComplete="off" defaultValue="" onKeyDown={e=>e.key==="Enter"&&tryLogin(pinRef.current?.value||"")} style={{flex:1}}/>
          <button className="primary" onClick={()=>tryLogin(pinRef.current?.value||"")}>{t.admin.enter}</button>
        </div>
        <div style={{marginTop:9,fontSize:"11px",color:"var(--tx3)"}}>{t.admin.pinDefault}</div>
      </div>
    );
    return(
      <div className="fade" style={{padding:"1.5rem 1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <div style={{fontFamily:"var(--fd)",fontSize:"22px",fontWeight:500}}>{t.admin.title}</div>
          <button className="ghost" onClick={()=>setAdmin(false)}>{t.admin.logout}</button>
        </div>

        {/* Participantes */}
        <section style={{marginBottom:"2rem"}}>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>{t.admin.participantsTitle}</div>
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            <input id="np" placeholder={t.admin.addName} style={{flex:1}} onKeyDown={e=>{ if(e.key==="Enter"){addP(e.target.value,document.getElementById("np-nip").value);e.target.value="";document.getElementById("np-nip").value="";} }}/>
            <input id="np-nip" placeholder="NIP" maxLength={4} style={{width:70,textAlign:"center"}} />
            <button className="primary" onClick={()=>{ const el=document.getElementById("np"); const nip=document.getElementById("np-nip"); addP(el.value,nip.value); el.value=""; nip.value=""; }}>
              <Plus size={13}/>{t.admin.add}
            </button>
          </div>
          {state.participants.length>0&&(
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr>
                  <th>Nombre</th>
                  {PHASES.map(p=><th key={p.key}>{t.phases[p.key].split(" ")[0]}</th>)}
                  <th>Torneo</th>
                  <th>NIP</th>
                  <th>Link</th>
                  <th></th>
                </tr></thead>
                <tbody>{state.participants.map(p=>(
                  <tr key={p.id}>
                    <td style={{fontFamily:"var(--fd)",fontSize:"14px"}}>{p.name}</td>
                    {[...PHASES.map(x=>x.key),"torneo"].map(k=>(
                      <td key={k}><input type="checkbox" checked={!!p.payments[k]} onChange={()=>togglePay(p.id,k)}/></td>
                    ))}
                    <td>
                      <input
                        type="text" maxLength={4}
                        key={`nip-${p.id}`}
                        defaultValue={p.nip||"1234"}
                        onBlur={e=>upd(s=>({...s,participants:s.participants.map(x=>x.id===p.id?{...x,nip:e.target.value.replace(/\D/g,"")}:x)}))}
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
                    <td><button className="danger" onClick={()=>removeP(p.id)} style={{padding:"3px 7px"}}><Trash2 size={11}/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pozos */}
        <section style={{marginBottom:"2rem"}}>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>{t.admin.poolsTitle}</div>
          <div style={{display:"grid",gap:7}}>
            {[...PHASES,{key:"torneo"}].map(({key})=>{
              const pool=state.pools[key];
              return(
                <div key={key} style={{background:"var(--bg2)",border:"0.5px solid var(--bdr2)",borderRadius:"var(--r)",padding:"11px 13px"}}>
                  <div style={{fontSize:"13px",fontWeight:500,marginBottom:9,fontFamily:"var(--fd)"}}>{t.phases[key]}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                    <div>
                      <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{t.admin.entryFee}</div>
                      <input type="number" min="0" key={`fee-${key}`} defaultValue={pool.entryFee} onBlur={e=>updPool(key,"entryFee",parseInt(e.target.value)||0)}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {["1°","2°","3°"].map((pos,i)=>(
                        <div key={i}>
                          <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{pos} lugar</div>
                          <PrizeInput
                            key={`prize-${key}-${i}`}
                            initialValue={pool.prizes?.[i]||0}
                            onSave={v=>{
                              const newPrizes=[...(pool.prizes||[0,0,0])];
                              newPrizes[i]=v;
                              updPool(key,"prizes",newPrizes);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {(()=>{ const total=(pool.prizes||[]).reduce((a,b)=>a+b,0); const p=pots[key]||0; return total>p&&p>0?<div style={{marginTop:5,fontSize:"10px",color:"var(--amber)"}}>⚠ Premios ({mxn(total)}) superan el pozo ({mxn(p)})</div>:null; })()}
                </div>
              );
            })}
          </div>
        </section>

        {/* Reglas */}
        <section style={{marginBottom:"2rem"}}>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>{t.admin.rulesTitle}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",gap:9}}>
            {[{l:t.admin.exactPts,f:"pointsExact"},{l:t.admin.winnerPts,f:"pointsWinner"},{l:t.admin.knockoutMult,f:"knockoutMultiplier"},{l:t.admin.adminPin,f:"adminPin",tp:"text"}].map(({l,f,tp="number"})=>(
              <div key={f}>
                <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{l}</div>
                <input type={tp} value={state.config[f]} onChange={e=>upd(s=>({...s,config:{...s.config,[f]:tp==="number"?(parseFloat(e.target.value)||0):e.target.value}}))}/>
              </div>
            ))}
          </div>
        </section>

        {/* Bloqueo de partidos */}
        <section style={{marginBottom:"2rem"}}>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>
            Cerrar pronosticos por partido
          </div>
          <div style={{display:"grid",gap:5}}>
            {state.matches
              .filter(m=>m.home&&m.away)
              .sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff))
              .slice(0,20)
              .map(m=>{
                const st=status(m.kickoff);
                const stColor=st==="live"?"var(--amber)":st==="finished"?"var(--green)":"var(--tx3)";
                const stLabel=st==="live"?"En vivo":st==="finished"?"Terminado":"Pendiente";
                return(
                  <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"center",padding:"9px 12px",background:m.locked?"rgba(91,184,168,0.05)":"var(--bg2)",border:`0.5px solid ${m.locked?"var(--bdr)":"var(--bdr2)"}`,borderRadius:"var(--r)"}}>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:500,color:"var(--tx)"}}>{m.home} vs {m.away}</div>
                      <div style={{fontSize:"9px",color:"var(--tx3)",marginTop:2}}>{fmtD(m.kickoff,lang)} · <span style={{color:stColor}}>{stLabel}</span></div>
                    </div>
                    <div style={{fontSize:"10px",color:m.locked?"var(--teal)":"var(--tx3)",fontWeight:m.locked?500:400}}>
                      {m.locked?"Cerrado":"Abierto"}
                    </div>
                    <button
                      onClick={()=>toggleLock(m.id)}
                      style={{
                        padding:"5px 10px",fontSize:"11px",
                        background:m.locked?"transparent":"rgba(217,95,95,0.1)",
                        borderColor:m.locked?"var(--bdr)":"var(--red)",
                        color:m.locked?"var(--teal)":"var(--red)",
                      }}
                    >
                      {m.locked?<><Unlock size={11}/> Abrir</>:<><Lock size={11}/> Cerrar</>}
                    </button>
                  </div>
                );
              })
            }
          </div>
        </section>

        {/* Datos */}
        <section>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>{t.admin.dataTitle}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={exportData}><Download size={12}/> {t.admin.export}</button>
            <button onClick={exportCSV}><Download size={12}/> CSV Participantes</button>
            <label style={{display:"inline-flex",alignItems:"center",gap:5,padding:"8px 14px",border:"0.5px solid var(--bdr2)",borderRadius:"var(--r)",cursor:"pointer",fontSize:"13px",color:"var(--tx2)"}}>
              <Upload size={12}/> {t.admin.importBtn}
              <input type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
            </label>
            <button className="danger" onClick={()=>{ if(confirm(t.admin.resetConfirm)){setState(DEFAULT);toast2("✓ Reset");} }}>
              <Trash2 size={12}/> {t.admin.resetBtn}
            </button>
          </div>
        </section>
        {/* ForensicBit */}
        <div style={{marginTop:"1.5rem",paddingTop:"1rem",borderTop:"0.5px solid rgba(91,184,168,0.1)",textAlign:"center"}}>
          <div style={{fontSize:"9px",color:"var(--tx3)"}}>Desarrollado para La Doce · Social.Roof.Bar</div>
          <div style={{fontSize:"11px",color:"var(--teal)",fontWeight:500,marginTop:"2px",letterSpacing:".03em"}}>Powered by ForensicBit Solutions</div>
        </div>
      </div>
    );
}

function PredInput({ matchId, field, initialValue, disabled, onSave }) {
  const [val, setVal] = useState(initialValue || "");
  const timerRef = useRef(null);

  // Sincronizar si el valor externo cambia y el input no tiene foco
  const inputRef = useRef(null);
  useEffect(()=>{
    if(inputRef.current && document.activeElement === inputRef.current) return;
    if(initialValue !== undefined && initialValue !== null && initialValue !== "")
      setVal(String(initialValue));
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

function Predictions({ pid, setPid, phase, setPhase, participants, predictions, matches, config, setPred, urlParticipant, t, lang }) {
  if(!pid) return(
    <div className="fade" style={{padding:"1.5rem 1rem"}}>
      <div style={{fontFamily:"var(--fd)",fontSize:"24px",fontWeight:500,marginBottom:6}}>{t.pred.whoAreYou}</div>
      <div style={{fontSize:"13px",color:"var(--tx3)",marginBottom:"1.5rem"}}>{t.pred.selectName}</div>
      {participants.length===0
        ? <div style={{color:"var(--tx3)",fontSize:"13px"}}>{t.pred.noParticipants}</div>
        : <div style={{display:"grid",gap:6}}>{participants.map(p=>(
            <button key={p.id} onClick={()=>setPid(p.id)} style={{padding:"13px 16px",justifyContent:"flex-start",fontSize:"15px",color:"var(--tx)",fontFamily:"var(--fd)",letterSpacing:".02em"}}>{p.name}</button>
          ))}</div>
      }
    </div>
  );
  const part = participants.find(p=>p.id===pid);
  const up = predictions[pid]||{};
  const ms = matches.filter(m=>m.phase===phase).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));
  return(
    <div className="fade">
      <div style={{padding:"1rem 1rem 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontFamily:"var(--fd)",fontSize:"19px",fontWeight:500}}>{part?.name}</div>
          <div style={{fontSize:"11px",color:"var(--tx3)"}}>Mundial 2026</div>
        </div>
        {!urlParticipant&&<button className="ghost" onClick={()=>setPid(null)}>{t.pred.change}</button>}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",padding:"0 1rem .9rem",scrollbarWidth:"none"}}>
        {PHASES.map(({key})=>(
          <button key={key} onClick={()=>setPhase(key)} className={`ptab${phase===key?" on":""}`}>
            {t.phases[key]} {part?.payments[key]?"✓":""}
          </button>
        ))}
      </div>
      {!part?.payments[phase]&&(
        <div style={{margin:"0 1rem .9rem",padding:"9px 13px",background:"var(--amber-d)",borderRadius:"var(--r)",fontSize:"12px",color:"var(--amber)"}}>{t.pred.notPaid}</div>
      )}
      <div style={{padding:"0 1rem 1.5rem",display:"grid",gap:4}}>
        {ms.map(m=>{
          const pr=up[m.id]||{home:"",away:""};
          return(
            <div key={m.id} className={`mrow${m.locked?" lk":""}`}>
              <div>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{m.group?`G-${m.group}`:m.id}</div>
                <div style={{fontSize:"9px",color:"var(--tx3)",marginTop:2}}>{fmtD(m.kickoff,lang)}</div>
              </div>
              <div style={{fontSize:"12px",textAlign:"right"}}>{m.home||"—"}</div>
              <div style={{display:"flex",gap:3,alignItems:"center",justifyContent:"center"}}>
                <PredInput matchId={m.id} field="home" initialValue={pr.home} disabled={m.locked||!m.home} onSave={v=>setPred(pid,m.id,"home",v)}/>
                <span style={{color:"var(--tx3)",fontSize:"11px"}}>–</span>
                <PredInput matchId={m.id} field="away" initialValue={pr.away} disabled={m.locked||!m.away} onSave={v=>setPred(pid,m.id,"away",v)}/>
              </div>
              <div style={{fontSize:"12px"}}>{m.away||"—"}</div>
              <div>{m.locked?<Lock size={11} style={{color:"var(--teal)",opacity:.7}}/>:<Unlock size={11} style={{color:"var(--tx3)",opacity:.2}}/>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrizeInput({ initialValue, onSave }) {
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

function SessionTimer({ participantId }) {
  const [remaining, setRemaining] = useState(()=>{
    if(typeof window === "undefined") return 600;
    const ts = parseInt(localStorage.getItem("ld-session-ts") || "0");
    const elapsed = Math.floor((Date.now() - ts) / 1000);
    return Math.max(0, 600 - elapsed);
  });

  useEffect(()=>{
    const tick = ()=>{
      const ts = parseInt(localStorage.getItem("ld-session-ts") || "0");
      const elapsed = Math.floor((Date.now() - ts) / 1000);
      const left = Math.max(0, 600 - elapsed);
      setRemaining(left);
      if(left === 0){
        localStorage.removeItem("ld-participant-id");
        localStorage.removeItem("ld-participant-name");
        localStorage.removeItem("ld-session-ts");
        window.location.href = "/p/" + participantId;
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    const renovar = ()=> localStorage.setItem("ld-session-ts", Date.now().toString());
    window.addEventListener("click", renovar);
    window.addEventListener("keydown", renovar);
    return ()=>{
      clearInterval(interval);
      window.removeEventListener("click", renovar);
      window.removeEventListener("keydown", renovar);
    };
  },[participantId]);

  const urgent = remaining < 120;
  return(
    <div style={{
      display:"flex",alignItems:"center",gap:4,
      padding:"4px 10px",borderRadius:20,
      background:urgent?"rgba(217,95,95,0.15)":"rgba(91,184,168,0.1)",
      border:`0.5px solid ${urgent?"var(--red)":"rgba(91,184,168,0.3)"}`,
      fontSize:"11px",
      color:urgent?"var(--red)":"var(--teal)",
    }}>
      <span style={{opacity:0.7}}>{urgent?"Sesion expira:":"Sesion:"}</span>
      <span style={{fontWeight:500}}>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}</span>
    </div>
  );
}

export default function App() {
  const [state,setState]   = useState(DEFAULT);
  const [ready,setReady]   = useState(false);
  const [lang,setLang]     = useState("es");
  const [view,setView]     = useState("home");
  const [isAdmin,setAdmin] = useState(false);
  const [pin,setPin]       = useState("");
  const pinRef = useRef(null);
  const router = useRouter();
  const urlParticipant = router.query.participant || null;
  // Timer de sesion movido a componente separado para evitar re-renders
  const [pid,setPid]       = useState(null);
  const [phase,setPhase]   = useState("grupos");
  const [toast,setToast]   = useState(null);
  const [menu,setMenu]     = useState(false);
  const t = T[lang];

  // Boot
  useEffect(()=>{
    const s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
    load().then(d=>{ if(d) setState(d); setReady(true); });
    return ()=>document.head.removeChild(s);
  },[]);

  // Persist
  useEffect(()=>{ if(ready) save(state); },[state,ready]);

  // Polling: recargar estado desde Supabase cada 30s para participantes
  useEffect(()=>{
    if(!ready || !urlParticipant) return;
    const interval = setInterval(async ()=>{
      const fresh = await load();
      if(fresh) setState(prev=>({...prev,
        // Solo actualizar partidos y resultados, no predicciones ni config
        // para evitar perder el foco en inputs mientras el usuario escribe
        matches: fresh.matches,
        participants: fresh.participants,
        pools: fresh.pools,
      }));
    }, 30000);
    return ()=> clearInterval(interval);
  },[ready, urlParticipant]);
  useEffect(()=>{ if(urlParticipant && ready) setPid(urlParticipant); },[urlParticipant,ready]);

  // Sesion de 10 minutos para participantes con link
  useEffect(()=>{
    if(!urlParticipant) return;
    const SESSION_KEY = "ld-session-ts";
    const SESSION_DURATION = 10 * 60 * 1000; // 10 minutos
    // Iniciar sesion si no existe
    if(!localStorage.getItem(SESSION_KEY)){
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    }
    // Revisar cada 30 segundos
    const interval = setInterval(()=>{
      const ts = parseInt(localStorage.getItem(SESSION_KEY) || "0");
      if(Date.now() - ts > SESSION_DURATION){
        localStorage.removeItem("ld-participant-id");
        localStorage.removeItem("ld-participant-name");
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "/p/" + urlParticipant;
      }
    }, 30000);
    // Renovar sesion en cada interaccion
    const renovar = ()=> localStorage.setItem(SESSION_KEY, Date.now().toString());
    window.addEventListener("click", renovar);
    window.addEventListener("keydown", renovar);
    return ()=>{
      clearInterval(interval);
      window.removeEventListener("click", renovar);
      window.removeEventListener("keydown", renovar);
    };
  },[urlParticipant]);

  // Migracion: actualizar partidos con fechas/equipos correctos preservando marcadores
  useEffect(()=>{
    if(!ready) return;
    const newMatches = generateGroupMatches();
    let needsMigration = false;
    const migratedMatches = state.matches.map(old => {
      // Solo migrar partidos de grupos
      if(old.phase !== "grupos") return old;
      // Buscar el partido correcto por grupo + equipos (en cualquier orden)
      const correct = newMatches.find(n =>
        n.group === old.group &&
        ((n.home === old.home && n.away === old.away) ||
         (n.home === old.away && n.away === old.home))
      );
      if(!correct) return old;
      // Si el kickoff o equipos difieren, migrar preservando marcadores
      if(correct.kickoff !== old.kickoff || correct.home !== old.home || correct.away !== old.away) {
        needsMigration = true;
        // Si los equipos estaban invertidos, invertir marcadores tambien
        const swapped = correct.home === old.away;
        return {
          ...old,
          home: correct.home,
          away: correct.away,
          kickoff: correct.kickoff,
          homeScore: swapped ? old.awayScore : old.homeScore,
          awayScore: swapped ? old.homeScore : old.awayScore,
        };
      }
      return old;
    });
    if(needsMigration) {
      upd(s=>({...s, matches: migratedMatches}));
      console.log("Migracion de partidos completada");
    }
  },[ready]);

  // Auto-lock past kickoffs
  useEffect(()=>{
    if(!ready) return;
    const now=Date.now();
    setState(p=>({...p,matches:p.matches.map(m=>(!m.locked&&new Date(m.kickoff).getTime()-30*60*1000<=now)?{...m,locked:true}:m)}));
  },[ready]);

  const toast2=(msg)=>{ setToast(msg); setTimeout(()=>setToast(null),2500); };
  const upd=(fn)=>setState(p=>fn(p));

  // Admin
  const tryLogin=(val)=>{
  if(val===state.config.adminPin){setAdmin(true);setPin("");toast2("✓ Bienvenido admin");}
  else toast2(t.admin.wrong);
};
  const addP=(name,nip)=>{ if(!name.trim()) return; upd(s=>({...s,participants:[...s.participants,{id:`p${Date.now()}`,name:name.trim(),payments:{},nip:nip||"1234"}]})); };
  const removeP=(id)=>upd(s=>{ const p={...s.predictions}; delete p[id]; return{...s,participants:s.participants.filter(x=>x.id!==id),predictions:p}; });
  const togglePay=(pid,k)=>upd(s=>({...s,participants:s.participants.map(p=>p.id===pid?{...p,payments:{...p.payments,[k]:!p.payments[k]}}:p)}));
  const updM=(id,f,v)=>upd(s=>({...s,matches:s.matches.map(m=>m.id===id?{...m,[f]:v}:m)}));
  const toggleLock=(id)=>upd(s=>({...s,matches:s.matches.map(m=>m.id===id?{...m,locked:!m.locked}:m)}));
  const lockPhase=(ph)=>{ upd(s=>({...s,matches:s.matches.map(m=>m.phase===ph?{...m,locked:true}:m)})); toast2("🔒 Fase bloqueada"); };
  const setPred=(p,m,f,v)=>upd(s=>({...s,predictions:{...s.predictions,[p]:{...(s.predictions[p]||{}),[m]:{...(s.predictions[p]?.[m]||{home:"",away:""}),[f]:v}}}}));
  const updPool=(k,f,v)=>upd(s=>({...s,pools:{...s.pools,[k]:{...s.pools[k],[f]:v}}}));

  const exportData=()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`ladoce-quiniela-${new Date().toISOString().split("T")[0]}.json`; a.click();
    toast2("✓ Backup descargado");
  };
  const exportCSV=()=>{
    const phases=[...PHASES.map(p=>p.key),"torneo"];
    const headers=["Nombre","NIP","Link",...phases.map(k=>k.charAt(0).toUpperCase()+k.slice(1))];
    const rows=state.participants.map(p=>{
      const link=`${window.location.origin}/p/${p.id}`;
      const payments=phases.map(k=>p.payments[k]?"Si":"No");
      return[p.name,p.nip||"",link,...payments];
    });
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`participantes-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    toast2("✓ CSV descargado");
  };
  const importData=(e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ try{setState(JSON.parse(ev.target.result));toast2("✓ Importado");}catch{toast2("⚠ Inválido");} }; r.readAsText(f); };

  // Leaderboard con tiebreaker 3 niveles
  const boards = useMemo(()=>{
    const res={};
    [...PHASES.map(p=>p.key),"torneo"].forEach(k=>{
      const ms=k==="torneo"?state.matches.sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff)):state.matches.filter(m=>m.phase===k).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));
      res[k]=state.participants.filter(p=>p.payments[k]).map(p=>{
        const up=state.predictions[p.id]||{}; let score=0,hits=0,kx=0;
        ms.forEach(m=>{ const s=pts(up[m.id],m,state.config); score+=s; if(s>0) hits++; if(s>=state.config.pointsExact*state.config.knockoutMultiplier&&m.phase!=="grupos") kx++; });
        return{id:p.id,name:p.name,score,hits,kx};
      }).sort((a,b)=>b.score-a.score||b.hits-a.hits||b.kx-a.kx);
    });
    return res;
  },[state]);

  const pots = useMemo(()=>{
    const r={};
    [...PHASES.map(p=>p.key),"torneo"].forEach(k=>{ r[k]=state.participants.filter(p=>p.payments[k]).length*(state.pools[k]?.entryFee||0); });
    return r;
  },[state.participants,state.pools]);

  const totalPot=Object.values(pots).reduce((a,b)=>a+b,0);

  const shareWA=(k)=>{
    const board=boards[k]||[]; const pot=pots[k]||0; const prizes=state.pools[k]?.prizes||[0,0,0]; const bolsa=Math.max(0,pot-prizes.reduce((a,b)=>a+b,0));
    let msg=t.wa.msg+`${t.phases[k]} — ${mxn(pot)}\n\n`;
    board.forEach((r,i)=>{ const em=["🥇","🥈","🥉"][i]||`${i+1}.`; const pr=prizes[i]>0?` (${mxn(prizes[i])})`:""; msg+=`${em} ${r.name}: ${r.score} pts${pr}\n`; });
    msg+="\n🌵 La Doce · Social.Roof.Bar · Powered by ForensicBit Solutions";
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  if(!ready) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#09090C",gap:16}}>
      <LogoMark size={40}/>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"13px",color:"rgba(91,184,168,0.5)",letterSpacing:".12em"}}>LA DOCE</div>
    </div>
  );

  // ── HEADER ────────────────────────────────────────────────
  const Header=()=>(
    <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(9,9,12,0.95)",backdropFilter:"blur(16px)",borderBottom:"0.5px solid rgba(91,184,168,0.1)"}}>
      <div className="gold-line"/>
      <div style={{maxWidth:700,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,padding:"0 1rem"}}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <LogoMark size={30}/>
          <div>
            <div style={{fontFamily:"var(--fd)",fontSize:"15px",fontWeight:600,color:"var(--teal)",lineHeight:1.1,letterSpacing:".02em"}}>LA DOCE</div>
            <div style={{fontSize:"9px",color:"var(--tx3)",letterSpacing:".12em",textTransform:"uppercase"}}>SOCIAL · ROOF · BAR</div>
          </div>
        </div>
        {/* Controls */}
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {urlParticipant&&<SessionTimer participantId={urlParticipant}/>}
          <button className="ghost" onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{padding:"4px 10px",fontSize:"11px",borderRadius:20}}>
            <Globe size={11}/> {lang==="es"?"EN":"ES"}
          </button>
          <button className="ghost" onClick={()=>setMenu(o=>!o)} style={{padding:"6px 8px"}}>
            {menu?<X size={16}/>:<Menu size={16}/>}
          </button>
        </div>
      </div>
      {/* Nav drawer */}
      {menu&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:".6rem 1rem .9rem",display:"flex",flexWrap:"wrap",gap:5,borderTop:"0.5px solid rgba(255,255,255,0.05)"}}>
          {[{id:"home",label:t.nav.home,icon:Trophy},{id:"predictions",label:t.nav.predictions,icon:Edit3},{id:"results",label:t.nav.results,icon:Zap},{id:"leaderboard",label:t.nav.leaderboard,icon:Award},{id:"admin",label:t.nav.admin,icon:Settings}].map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>{setView(id);setMenu(false);}} className={`ptab${view===id?" on":""}`} style={{fontSize:"12px"}}>
              <Icon size={12}/>{label}
            </button>
          ))}
        </div>
      )}
    </header>
  );

  // ── HOME DASHBOARD ──────────────────────────────────────────
  // Componentes extraidos — ver funciones externas arriba de App()
  // Home, Results, Leaderboard, Admin son componentes externos
  // ── RENDER ────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Header/>
      <main style={{maxWidth:700,margin:"0 auto"}}>
        {view==="home" && <Home
            state={state} urlParticipant={urlParticipant}
            pots={pots} totalPot={totalPot} boards={boards}
            t={t} lang={lang}
          />}
        {view==="predictions" && <Predictions
            pid={pid} setPid={setPid}
            phase={phase} setPhase={setPhase}
            participants={state.participants}
            predictions={state.predictions}
            matches={state.matches}
            config={state.config}
            setPred={setPred}
            urlParticipant={urlParticipant}
            t={t} lang={lang}
          />}
        {view==="results" && <Results
            state={state} phase={phase} setPhase={setPhase}
            isAdmin={isAdmin} updM={updM} toggleLock={toggleLock}
            lockPhase={lockPhase} t={t} lang={lang}
          />}
        {view==="leaderboard" && <Leaderboard
            state={state} phase={phase} setPhase={setPhase}
            isAdmin={isAdmin} pots={pots} boards={boards}
            shareWA={shareWA} t={t}
          />}
        {view==="admin" && <Admin
            state={state} upd={upd} isAdmin={isAdmin} setAdmin={setAdmin}
            pin={pin} setPin={setPin} tryLogin={tryLogin}
            addP={addP} removeP={removeP} togglePay={togglePay}
            updM={updM} toggleLock={toggleLock} lockPhase={lockPhase}
            updPool={updPool} exportData={exportData} exportCSV={exportCSV} importData={importData}
            pots={pots} toast2={toast2} t={t} lang={lang}
            PHASES={PHASES} status={status} fmtD={fmtD}
          />}
      </main>
      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}
