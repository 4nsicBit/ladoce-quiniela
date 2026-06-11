import { supabase } from '../lib/supabaseClient'
import { useState, useEffect, useMemo, useRef } from "react"
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

const makeKickoff = (gi, mi) => {
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
};

const generateKnockouts = () => {
  const defs=[{phase:"r32",count:16,start:"2026-07-01T19:00:00-06:00"},{phase:"r16",count:8,start:"2026-07-05T19:00:00-06:00"},{phase:"cuartos",count:4,start:"2026-07-10T19:00:00-06:00"},{phase:"semis",count:2,start:"2026-07-14T19:00:00-06:00"},{phase:"final",count:1,start:"2026-07-19T17:00:00-06:00"}];
  const m=[];
  defs.forEach(({phase,count,start})=>{
    for(let i=1;i<=count;i++){
      m.push({id:`${phase.toUpperCase()}-${String(i).padStart(2,"0")}`,phase,group:null,home:"",away:"",homeScore:null,awayScore:null,kickoff:new Date(new Date(start).getTime()+(i-1)*43200000).toISOString(),locked:false});
    }
  });
  return m;
};

const PHASES=[{key:"grupos"},{key:"r32"},{key:"r16"},{key:"cuartos"},{key:"semis"},{key:"final"}];

const DEFAULT={
  config:{adminPin:"1234",pointsExact:3,pointsWinner:1,knockoutMultiplier:2},
  pools:{
    grupos:{entryFee:100,distribution:[100]},r32:{entryFee:100,distribution:[100]},
    r16:{entryFee:100,distribution:[100]},cuartos:{entryFee:150,distribution:[70,30]},
    semis:{entryFee:200,distribution:[70,30]},final:{entryFee:300,distribution:[100]},
    torneo:{entryFee:500,distribution:[50,30,20]},
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
      if(fresh) setState(fresh);
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

  // Auto-lock past kickoffs
  useEffect(()=>{
    if(!ready) return;
    const now=Date.now();
    setState(p=>({...p,matches:p.matches.map(m=>(!m.locked&&new Date(m.kickoff).getTime()-30*60*1000<=now)?{...m,locked:true}:m)}));
  },[ready]);

  const toast2=(msg)=>{ setToast(msg); setTimeout(()=>setToast(null),2500); };
  const upd=(fn)=>setState(p=>fn(p));

  // Admin
  const tryLogin=()=>{
  const val=pinRef.current?pinRef.current.value:pin;
  if(val===state.config.adminPin){setAdmin(true);if(pinRef.current)pinRef.current.value="";setPin("");toast2("✓ Bienvenido admin");}
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
    const board=boards[k]||[]; const pot=pots[k]||0; const dist=state.pools[k]?.distribution||[100];
    let msg=t.wa.msg+`${t.phases[k]} — ${mxn(pot)}\n\n`;
    board.forEach((r,i)=>{ const em=["🥇","🥈","🥉"][i]||`${i+1}.`; const pr=i<dist.length?` (${mxn(pot*dist[i]/100)})`:""; msg+=`${em} ${r.name}: ${r.score} pts${pr}\n`; });
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

  // ── HOME ──────────────────────────────────────────────────
  const Home=()=>(
    <div className="fade">
      {/* Hero */}
      <div className="hero-bg" style={{textAlign:"center",padding:"2.5rem 1rem 2rem"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <LogoMark size={52}/>
        </div>
        <div style={{fontFamily:"var(--fd)",fontSize:"clamp(11px,3vw,14px)",color:"var(--teal)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:6}}>La Doce · Social.Roof.Bar</div>
        <div style={{fontFamily:"var(--fd)",fontSize:"clamp(24px,6vw,38px)",fontWeight:500,lineHeight:1.15,marginBottom:8}}>
          <span style={{color:"var(--tx)"}}>Quiniela </span>
          <span style={{color:"var(--sand)"}}>Mundial 2026</span>
        </div>
        <div style={{fontSize:"12px",color:"var(--tx3)",letterSpacing:".04em"}}>{t.home.subtitle}</div>
      </div>

      <div style={{padding:"1.5rem 1rem"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:"1.5rem"}}>
          {[{l:t.home.participants,v:state.participants.length},{l:t.home.totalPot,v:mxn(totalPot)},{l:t.home.matchesLoaded,v:`${state.matches.filter(m=>m.homeScore!==null).length}/${state.matches.length}`}].map(({l,v})=>(
            <div key={l} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"13px 10px",textAlign:"center"}}>
              <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:4,letterSpacing:".04em"}}>{l}</div>
              <div style={{fontSize:"clamp(14px,3.5vw,18px)",fontWeight:500}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Pools */}
        <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",marginBottom:9,letterSpacing:".1em",textTransform:"uppercase"}}>{t.home.poolsTitle}</div>
        <div style={{display:"grid",gap:5,marginBottom:"1.5rem"}}>
          {[...PHASES,{key:"torneo"}].map(({key})=>{
            const pool=state.pools[key]; const n=state.participants.filter(p=>p.payments[key]).length; const pot=pots[key];
            return(
              <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",background:"var(--bg2)",border:"0.5px solid var(--bdr2)",borderRadius:"var(--r)"}}>
                <div>
                  <div style={{fontSize:"13px",fontWeight:500}}>{t.phases[key]}</div>
                  <div style={{fontSize:"10px",color:"var(--tx3)",marginTop:2}}>{n} {t.home.paid} × {mxn(pool.entryFee)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"15px",fontWeight:500,color:"var(--sand)"}}>{mxn(pot)}</div>
                  <div style={{fontSize:"9px",color:"var(--tx3)"}}>{t.home.distLabel} {pool.distribution.join("/")}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="card card-teal">
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--teal)",marginBottom:12,letterSpacing:".1em",textTransform:"uppercase"}}>{t.home.howTitle}</div>
          {[t.home.how1,t.home.how2,`${state.config.pointsExact} ${t.home.how3pts} ${state.config.pointsWinner} ${t.home.how3win}${state.config.knockoutMultiplier}.`,t.home.how4].map((txt,i)=>(
            <div key={i} style={{display:"flex",gap:10,fontSize:"13px",color:"var(--tx2)",lineHeight:1.65,marginBottom:8}}>
              <span style={{color:"var(--teal)",flexShrink:0,fontFamily:"var(--fd)",fontSize:"15px"}}>{i+1}.</span>
              <span>{txt}</span>
            </div>
          ))}
        </div>

        {/* ForensicBit footer */}
        <div style={{textAlign:"center",padding:"16px 10px 8px",borderTop:"0.5px solid rgba(91,184,168,0.08)",marginTop:"1rem"}}>
          <div style={{fontSize:"9px",color:"var(--tx3)",letterSpacing:".06em"}}>Desarrollado para La Doce · Social.Roof.Bar</div>
          <div style={{fontSize:"10px",color:"var(--teal)",fontWeight:500,letterSpacing:".04em",marginTop:"2px"}}>Powered by ForensicBit Solutions</div>
        </div>
      </div>
    </div>
  );

  // ── PREDICTIONS ───────────────────────────────────────────
  const Predictions=()=>{
    if(!pid) return(
      <div className="fade" style={{padding:"1.5rem 1rem"}}>
        <div style={{fontFamily:"var(--fd)",fontSize:"24px",fontWeight:500,marginBottom:6}}>{t.pred.whoAreYou}</div>
        <div style={{fontSize:"13px",color:"var(--tx3)",marginBottom:"1.5rem"}}>{t.pred.selectName}</div>
        {state.participants.length===0
          ? <div style={{color:"var(--tx3)",fontSize:"13px"}}>{t.pred.noParticipants}</div>
          : <div style={{display:"grid",gap:6}}>{state.participants.map(p=>(
              <button key={p.id} onClick={()=>setPid(p.id)} style={{padding:"13px 16px",justifyContent:"flex-start",fontSize:"15px",color:"var(--tx)",fontFamily:"var(--fd)",letterSpacing:".02em"}}>{p.name}</button>
            ))}</div>
        }
      </div>
    );
    const part=state.participants.find(p=>p.id===pid);
    const up=state.predictions[pid]||{};
    const ms=state.matches.filter(m=>m.phase===phase).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));
    return(
      <div className="fade">
        <div style={{padding:"1rem 1rem 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontFamily:"var(--fd)",fontSize:"19px",fontWeight:500}}>{part?.name}</div>
            <div style={{fontSize:"11px",color:"var(--tx3)"}}>Mundial 2026</div>
          </div>
          {!urlParticipant && <button className="ghost" onClick={()=>setPid(null)}>{t.pred.change}</button>}
        </div>
        {/* Phase tabs */}
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
                  <input type="number" min="0" max="20" className="si" key={`ph-${m.id}`} defaultValue={pr.home} disabled={m.locked||!m.home} onBlur={e=>setPred(pid,m.id,"home",e.target.value)} style={{width:38}}/>
                  <span style={{color:"var(--tx3)",fontSize:"11px"}}>–</span>
                  <input type="number" min="0" max="20" className="si" key={`pa-${m.id}`} defaultValue={pr.away} disabled={m.locked||!m.away} onBlur={e=>setPred(pid,m.id,"away",e.target.value)} style={{width:38}}/>
                </div>
                <div style={{fontSize:"12px"}}>{m.away||"—"}</div>
                <div>{m.locked?<Lock size={11} style={{color:"var(--teal)",opacity:.7}}/>:<Unlock size={11} style={{color:"var(--tx3)",opacity:.2}}/>}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── RESULTS ───────────────────────────────────────────────
  const Results=()=>{
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
  };

  // ── LEADERBOARD ───────────────────────────────────────────
  const Leaderboard=()=>{
    const board=boards[phase]||[]; const pool=state.pools[phase]; const pot=pots[phase]||0; const dist=pool?.distribution||[100];
    return(
      <div className="fade" style={{padding:"1.5rem 1rem"}}>
        <div style={{fontFamily:"var(--fd)",fontSize:"22px",fontWeight:500,marginBottom:"1rem"}}>{t.lb.title}</div>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:"1rem",scrollbarWidth:"none"}}>
          {[...PHASES,{key:"torneo"}].map(({key})=>(
            <button key={key} onClick={()=>setPhase(key)} className={`ptab${phase===key?" on":""}`}>{t.phases[key]}</button>
          ))}
        </div>

        {/* Pot card */}
        <div className="card card-sand" style={{marginBottom:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:"10px",color:"var(--tx3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{t.lb.pot}</div>
              <div style={{fontFamily:"var(--fd)",fontSize:"clamp(24px,5vw,32px)",fontWeight:500,color:"var(--sand)",lineHeight:1.05}}>{mxn(pot)}</div>
            </div>
            <button className="sand" onClick={()=>shareWA(phase)} style={{fontSize:"12px"}}><Share2 size={12}/> WhatsApp</button>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {dist.map((pct,i)=>(
              <div key={i} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"6px 13px"}}>
                <div style={{fontSize:"9px",color:"var(--tx3)"}}>{i+1}°</div>
                <div style={{fontSize:"13px",fontWeight:500,color:"var(--sand-l)"}}>{mxn(pot*pct/100)}</div>
              </div>
            ))}
          </div>
        </div>

        {board.length===0
          ?<div style={{color:"var(--tx3)",fontSize:"13px"}}>{t.lb.noPaid}</div>
          :<div style={{display:"grid",gap:4}}>
            {board.map((row,idx)=>{
              const cl=["r1","r2","r3"][idx]||"";
              const prize=idx<dist.length?mxn(pot*dist[idx]/100):null;
              return(
                <div key={row.id} style={{display:"grid",gridTemplateColumns:"30px 1fr auto auto auto",gap:10,alignItems:"center",padding:"11px 14px",background:idx<dist.length?"rgba(200,169,106,0.05)":"var(--bg2)",border:`0.5px solid ${idx<dist.length?"var(--bdrS)":"var(--bdr2)"}`,borderRadius:"var(--r)"}}>
                  <span className={cl} style={{fontSize:"14px",fontWeight:500}}>{idx+1}</span>
                  <span style={{fontSize:"14px",fontWeight:idx===0?500:400,fontFamily:idx<3?"var(--fd)":"var(--fb)"}}>{row.name}</span>
                  <span style={{fontSize:"10px",color:"var(--tx3)"}}>{row.hits} {t.lb.hits}</span>
                  <span style={{fontSize:"14px",fontWeight:500}}>{row.score} <span style={{fontSize:"10px",color:"var(--tx3)"}}>{t.lb.pts}</span></span>
                  {prize?<span style={{fontSize:"12px",color:"var(--sand)",fontWeight:500,textAlign:"right"}}>{prize}</span>:<span/>}
                </div>
              );
            })}
          </div>
        }
        <div style={{marginTop:12,fontSize:"10px",color:"var(--tx3)"}}>{t.lb.tieNote}</div>
      </div>
    );
  };

  // ── ADMIN ─────────────────────────────────────────────────
  const Admin=()=>{
    if(!isAdmin) return(
      <div className="fade" style={{padding:"2rem 1rem"}}>
        <div style={{fontFamily:"var(--fd)",fontSize:"24px",fontWeight:500,marginBottom:6}}>{t.admin.pinTitle}</div>
        <div style={{fontSize:"13px",color:"var(--tx3)",marginBottom:"1.5rem"}}>{t.admin.pinSub}</div>
        <div style={{display:"flex",gap:8,maxWidth:300}}>
          <input ref={pinRef} type="password" placeholder="PIN" autoComplete="off" defaultValue="" onKeyDown={e=>e.key==="Enter"&&tryLogin()} style={{flex:1}}/>
          <button className="primary" onClick={tryLogin}>{t.admin.enter}</button>
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
                  <th>NIP</th>
                  <th>Link</th>
                  {PHASES.map(p=><th key={p.key}>{t.phases[p.key].split(" ")[0]}</th>)}
                  <th>Torneo</th><th></th>
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
              const pool=state.pools[key]; const sum=pool.distribution.reduce((a,b)=>a+b,0);
              return(
                <div key={key} style={{background:"var(--bg2)",border:"0.5px solid var(--bdr2)",borderRadius:"var(--r)",padding:"11px 13px"}}>
                  <div style={{fontSize:"13px",fontWeight:500,marginBottom:9,fontFamily:"var(--fd)"}}>{t.phases[key]}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                    <div>
                      <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{t.admin.entryFee}</div>
                      <input type="number" min="0" key={`fee-${key}`} defaultValue={pool.entryFee} onBlur={e=>updPool(key,"entryFee",parseInt(e.target.value)||0)}/>
                    </div>
                    <div>
                      <div style={{fontSize:"10px",color:"var(--tx3)",marginBottom:3}}>{t.admin.distribution}</div>
                      <input type="text" key={`dist-${key}`} defaultValue={pool.distribution.join(",")} onBlur={e=>updPool(key,"distribution",e.target.value.split(",").map(x=>parseFloat(x)||0))}/>
                    </div>
                  </div>
                  {sum!==100&&<div style={{marginTop:5,fontSize:"10px",color:"var(--amber)"}}>{t.admin.sumWarning}</div>}
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

        {/* Datos */}
        <section>
          <div style={{fontSize:"10px",fontWeight:500,color:"var(--tx3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:11}}>{t.admin.dataTitle}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={exportData}><Download size={12}/> {t.admin.export}</button>
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
  };

  // ── RENDER ────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Header/>
      <main style={{maxWidth:700,margin:"0 auto"}}>
        {view==="home"        && <Home/>}
        {view==="predictions" && <Predictions/>}
        {view==="results"     && <Results/>}
        {view==="leaderboard" && <Leaderboard/>}
        {view==="admin"       && <Admin/>}
      </main>
      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}
