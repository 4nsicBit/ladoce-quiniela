import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Mapeo de nombres de equipos API-Football (inglés) → nombres en la app (español)
const TEAM_MAP = {
  'Mexico': 'México',
  'South Africa': 'Sudáfrica',
  'South Korea': 'Corea del Sur',
  'Czech Republic': 'Chequia',
  'Czechia': 'Chequia',
  'Canada': 'Canadá',
  'Bosnia and Herzegovina': 'Bosnia y Herz.',
  'Bosnia & Herzegovina': 'Bosnia y Herz.',
  'Switzerland': 'Suiza',
  'Brazil': 'Brasil',
  'Morocco': 'Marruecos',
  'Haiti': 'Haití',
  'Scotland': 'Escocia',
  'Australia': 'Australia',
  'Turkey': 'Turquía',
  'Paraguay': 'Paraguay',
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'Germany': 'Alemania',
  'Curacao': 'Curazao',
  "Ivory Coast": 'Costa de Marfil',
  "Côte d'Ivoire": 'Costa de Marfil',
  'Netherlands': 'Países Bajos',
  'Japan': 'Japón',
  'Tunisia': 'Túnez',
  'Sweden': 'Suecia',
  'Spain': 'España',
  'Cape Verde': 'Cabo Verde',
  'Belgium': 'Bélgica',
  'Egypt': 'Egipto',
  'Saudi Arabia': 'Arabia Saudita',
  'Uruguay': 'Uruguay',
  'Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda',
  'France': 'Francia',
  'Senegal': 'Senegal',
  'Iraq': 'Irak',
  'Norway': 'Noruega',
  'Argentina': 'Argentina',
  'Algeria': 'Argelia',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  'Portugal': 'Portugal',
  'DR Congo': 'RD Congo',
  'Congo DR': 'RD Congo',
  'England': 'Inglaterra',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'Panama': 'Panamá',
  'Uzbekistan': 'Uzbekistán',
  'Colombia': 'Colombia',
  'Qatar': 'Qatar',
  'Ecuador': 'Ecuador',
}

function toApp(name) {
  return TEAM_MAP[name] || name
}

export default async function handler(req, res) {
  // Verificar que la llamada viene del cron autorizado
  const auth = req.headers.authorization
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Obtener todos los fixtures en vivo (sin filtro de liga para evitar ID incorrecto)
    const apiRes = await fetch(
      'https://v3.football.api-sports.io/fixtures?live=all',
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    )
    const apiData = await apiRes.json()
    const liveFixtures = apiData.response || []

    console.log(`[update-scores] fixtures en vivo: ${liveFixtures.length}`, liveFixtures.map(f=>`${f.teams.home.name} vs ${f.teams.away.name}`))

    if (liveFixtures.length === 0) {
      return res.status(200).json({ ok: true, updated: 0, live: 0 })
    }

    // Cargar estado actual desde Supabase
    const { data } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'ld-quiniela-2026-v1')
      .single()

    if (!data) return res.status(404).json({ error: 'Estado no encontrado' })

    const state = data.value
    let updated = 0

    const newMatches = state.matches.map(match => {
      const matchTime = new Date(match.kickoff).getTime()

      // Buscar fixture por tiempo de kickoff (tolerancia ±15 min)
      const candidates = liveFixtures.filter(f => {
        const ft = new Date(f.fixture.date).getTime()
        return Math.abs(ft - matchTime) < 15 * 60 * 1000
      })

      let fixture = null
      if (candidates.length === 1) {
        fixture = candidates[0]
      } else if (candidates.length > 1) {
        // Hay partidos simultáneos — desambiguar por nombre del equipo local
        fixture = candidates.find(f => toApp(f.teams.home.name) === match.home)
      }

      if (!fixture) return match

      // Si la API devuelve null para goles en partido en vivo, inicializar en 0
      const homeScore = fixture.goals.home ?? 0
      const awayScore = fixture.goals.away ?? 0

      // Solo actualizar si el marcador cambió
      if (homeScore === match.homeScore && awayScore === match.awayScore) return match

      updated++
      return { ...match, homeScore, awayScore }
    })

    if (updated > 0) {
      await supabase
        .from('config')
        .upsert({ key: 'ld-quiniela-2026-v1', value: { ...state, matches: newMatches } }, { onConflict: 'key' })
    }

    return res.status(200).json({ ok: true, updated, live: liveFixtures.length })
  } catch (e) {
    console.error('update-scores error:', e)
    return res.status(500).json({ error: 'Error interno' })
  }
}
