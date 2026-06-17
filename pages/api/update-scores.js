import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Mapeo nombres football-data.org (inglés) → nombres en la app (español)
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
  'Germany': 'Alemania',
  'Curacao': 'Curazao',
  'Curaçao': 'Curazao',
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

// Statuses de football-data.org que tienen marcador real
const SCORED_STATUSES = new Set(['IN_PLAY', 'PAUSED', 'FINISHED'])

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const now = new Date()
    const todayUTC = now.toISOString().split('T')[0]
    // También consultar ayer UTC para cubrir partidos nocturnos (ej: 23:00 CDMX = 04:00 UTC del día siguiente)
    const yesterdayUTC = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${yesterdayUTC}&dateTo=${todayUTC}`,
      { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN } }
    )
    const apiData = await apiRes.json()

    // Detectar errores de la API (token inválido, cuota, etc.)
    if (apiData.errorCode) {
      console.error('[update-scores] API error:', apiData.message)
      return res.status(200).json({ ok: false, apiErrors: { code: apiData.errorCode, message: apiData.message } })
    }

    const allMatches = apiData.matches || []
    // Solo partidos en curso o terminados con marcador disponible
    const fixtures = allMatches.filter(m =>
      SCORED_STATUSES.has(m.status) && m.score.fullTime.home !== null
    )

    console.log(`[update-scores] ${yesterdayUTC}→${todayUTC} — total: ${allMatches.length}, con marcador: ${fixtures.length}`)

    if (fixtures.length === 0) {
      return res.status(200).json({ ok: true, updated: 0, total: allMatches.length, withScore: 0 })
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

      // Buscar fixture por kickoff ±15 min
      const candidates = fixtures.filter(f => {
        const ft = new Date(f.utcDate).getTime()
        return Math.abs(ft - matchTime) < 15 * 60 * 1000
      })

      let fixture = null
      if (candidates.length === 1) {
        fixture = candidates[0]
      } else if (candidates.length > 1) {
        // Partidos simultáneos — desambiguar por equipo local
        fixture = candidates.find(f => toApp(f.homeTeam.name) === match.home)
      }

      if (!fixture) return match

      const homeScore = fixture.score.fullTime.home ?? 0
      const awayScore = fixture.score.fullTime.away ?? 0

      if (homeScore === match.homeScore && awayScore === match.awayScore) return match

      updated++
      log.push(`${match.home} ${homeScore}-${awayScore} ${match.away} [${fixture.status}]`)
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

    return res.status(200).json({ ok: true, updated, withScore: fixtures.length, changes: log })
  } catch (e) {
    console.error('update-scores error:', e)
    return res.status(500).json({ error: 'Error interno', message: e.message })
  }
}
