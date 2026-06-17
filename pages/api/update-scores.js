import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

// Statuses que tienen marcador real (en curso o terminados)
const SCORED_STATUSES = new Set(['1H','HT','2H','ET','BT','P','SUSP','INT','LIVE','FT','AET','PEN'])

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Usar fecha UTC de hoy — cubre partidos nocturnos que en UTC ya son el día siguiente
    const todayUTC = new Date().toISOString().split('T')[0]

    const apiRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${todayUTC}`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    )
    const apiData = await apiRes.json()

    // Detectar errores de la API (cuota, key inválida, etc.)
    if (apiData.errors && Object.keys(apiData.errors).length > 0) {
      console.error('[update-scores] API Football error:', JSON.stringify(apiData.errors))
      return res.status(200).json({ ok: false, apiErrors: apiData.errors })
    }

    const allFixtures = apiData.response || []
    // Solo fixtures que ya tienen marcador (en curso o terminados)
    const fixtures = allFixtures.filter(f => SCORED_STATUSES.has(f.fixture.status.short))

    console.log(`[update-scores] ${todayUTC} — total: ${allFixtures.length}, con marcador: ${fixtures.length}`)

    if (fixtures.length === 0) {
      return res.status(200).json({ ok: true, updated: 0, total: allFixtures.length, withScore: 0, date: todayUTC })
    }

    const { data } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'ld-quiniela-2026-v1')
      .single()

    if (!data) return res.status(404).json({ error: 'Estado no encontrado' })

    const state = data.value
    let updated = 0
    const log = []

    const newMatches = state.matches.map(match => {
      const matchTime = new Date(match.kickoff).getTime()

      const candidates = fixtures.filter(f => {
        const ft = new Date(f.fixture.date).getTime()
        return Math.abs(ft - matchTime) < 15 * 60 * 1000
      })

      let fixture = null
      if (candidates.length === 1) {
        fixture = candidates[0]
      } else if (candidates.length > 1) {
        fixture = candidates.find(f => toApp(f.teams.home.name) === match.home)
      }

      if (!fixture) return match

      const homeScore = fixture.goals.home ?? 0
      const awayScore = fixture.goals.away ?? 0

      if (homeScore === match.homeScore && awayScore === match.awayScore) return match

      updated++
      log.push(`${match.home} ${homeScore}-${awayScore} ${match.away} [${fixture.fixture.status.short}]`)
      return { ...match, homeScore, awayScore }
    })

    if (updated > 0) {
      const { error: upsertErr } = await supabase
        .from('config')
        .upsert({ key: 'ld-quiniela-2026-v1', value: { ...state, matches: newMatches } }, { onConflict: 'key' })
      if (upsertErr) {
        console.error('[update-scores] upsert error:', upsertErr)
        return res.status(500).json({ ok: false, error: 'Supabase upsert failed', details: upsertErr })
      }
    }

    return res.status(200).json({ ok: true, updated, withScore: fixtures.length, date: todayUTC, changes: log })
  } catch (e) {
    console.error('update-scores error:', e)
    return res.status(500).json({ error: 'Error interno', message: e.message })
  }
}
