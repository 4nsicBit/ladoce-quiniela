import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/index.js", encoding="utf-8") as f:
    content = f.read()

# Agregar useEffect de migracion despues del autolock
old = '  // Auto-lock past kickoffs'
new = '''  // Migracion: actualizar partidos con fechas/equipos correctos preservando marcadores
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

  // Auto-lock past kickoffs'''

print("Fix migracion:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/index.js", "w", encoding="utf-8") as f:
    f.write(content)
