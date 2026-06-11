import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()
    lines = f.readlines() if False else content.split("\n")

# Extraer cada componente por rango de lineas (0-indexed)
home_code = "\n".join(lines[612:838])        # 613-838
results_code = "\n".join(lines[842:897])     # 843-897  
leaderboard_code = "\n".join(lines[898:959]) # 899-959
admin_code = "\n".join(lines[960:1151])      # 961-1151

print("Home lineas:", len(home_code.split("\n")))
print("Results lineas:", len(results_code.split("\n")))
print("Leaderboard lineas:", len(leaderboard_code.split("\n")))
print("Admin lineas:", len(admin_code.split("\n")))

# Variables que usa cada componente del scope de App:
# Home: state, urlParticipant, pots, totalPot, boards, pts, t, lang, fmtD, flagUrl
# Results: state, phase, setPhase, isAdmin, updM, toggleLock, lockPhase, t, lang, fmtD, status
# Leaderboard: state, phase, setPhase, isAdmin, pots, boards, mxn, shareWA, t
# Admin: state, upd, isAdmin, setAdmin, pin, setPin, tryLogin, addP, removeP, togglePay,
#        updM, toggleLock, lockPhase, setPred, updPool, exportData, importData,
#        pots, toast2, t, lang, fmtD, status, PHASES, mxn

print("OK - analisis completo")
