import sys
sys.stdout.reconfigure(encoding="utf-8")

with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()
    lines = content.split("\n")

# ── EXTRAER BLOQUES ──────────────────────────────────────────
home_inner = "\n".join(lines[612:838])
results_inner = "\n".join(lines[842:897])
leaderboard_inner = "\n".join(lines[898:959])
admin_inner = "\n".join(lines[960:1151])

# ── TRANSFORMAR: quitar "  const X=()=>{" del inicio y "};" del final
def extract_body(code, name):
    lines_c = code.split("\n")
    # Quitar primera linea (const X=()=>{) y ultima (};)
    body = "\n".join(lines_c[1:-1])
    return body

home_body = extract_body(home_inner, "Home")
results_body = extract_body(results_inner, "Results")
leaderboard_body = extract_body(leaderboard_inner, "Leaderboard")
admin_body = extract_body(admin_inner, "Admin")

# ── NUEVO CONTENIDO: componentes externos con props ──────────
new_components = """
// ═══════════════════════════════════════════════════════════
// COMPONENTES EXTERNOS — fuera de App para evitar re-renders
// ═══════════════════════════════════════════════════════════

function Home({state,urlParticipant,pots,totalPot,boards,t,lang}) {
""" + home_body.replace("urlParticipant","urlParticipant").replace(
    "state.","state.").replace("pots[","pots[").replace(
    "totalPot","totalPot").replace("boards[","boards[") + """
}

function Results({state,phase,setPhase,isAdmin,updM,toggleLock,lockPhase,t,lang}) {
""" + results_body + """
}

function Leaderboard({state,phase,setPhase,isAdmin,pots,boards,shareWA,t}) {
""" + leaderboard_body + """
}

function Admin({state,upd,isAdmin,setAdmin,pin,setPin,tryLogin,addP,removeP,
  togglePay,updM,toggleLock,lockPhase,updPool,exportData,importData,
  pots,toast2,t,lang,PHASES,status,fmtD}) {
""" + admin_body + """
}
"""

# ── REEMPLAZAR en index.js ──────────────────────────────────
# Quitar los 4 componentes internos
old_section = "\n".join(lines[612:1151])
new_section = """  // Componentes extraidos — ver funciones externas arriba de App()
  // Home, Results, Leaderboard, Admin son componentes externos"""

new_content = content.replace(old_section, new_section)

# ── ACTUALIZAR RENDER para pasar props ──────────────────────
new_content = new_content.replace(
    "{view===\"home\"        && <Home/>}",
    """{view===\"home\" && <Home
            state={state} urlParticipant={urlParticipant}
            pots={pots} totalPot={totalPot} boards={boards}
            t={t} lang={lang}
          />}"""
)
new_content = new_content.replace(
    "{view===\"results\"     && <Results/>}",
    """{view===\"results\" && <Results
            state={state} phase={phase} setPhase={setPhase}
            isAdmin={isAdmin} updM={updM} toggleLock={toggleLock}
            lockPhase={lockPhase} t={t} lang={lang}
          />}"""
)
new_content = new_content.replace(
    "{view===\"leaderboard\" && <Leaderboard/>}",
    """{view===\"leaderboard\" && <Leaderboard
            state={state} phase={phase} setPhase={setPhase}
            isAdmin={isAdmin} pots={pots} boards={boards}
            shareWA={shareWA} t={t}
          />}"""
)
new_content = new_content.replace(
    "{view===\"admin\"       && <Admin/>}",
    """{view===\"admin\" && <Admin
            state={state} upd={upd} isAdmin={isAdmin} setAdmin={setAdmin}
            pin={pin} setPin={setPin} tryLogin={tryLogin}
            addP={addP} removeP={removeP} togglePay={togglePay}
            updM={updM} toggleLock={toggleLock} lockPhase={lockPhase}
            updPool={updPool} exportData={exportData} importData={importData}
            pots={pots} toast2={toast2} t={t} lang={lang}
            PHASES={PHASES} status={status} fmtD={fmtD}
          />}"""
)

# Insertar nuevos componentes antes de function PredInput
insert_marker = "function PredInput({ matchId, field, initialValue, disabled, onSave }) {"
new_content = new_content.replace(insert_marker, new_components + "\n" + insert_marker)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Refactor completo OK")
print("Lineas resultado:", len(new_content.split("\n")))
