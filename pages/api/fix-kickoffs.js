import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Horarios correctos Jun 27 (CDMX UTC-6)
// G067/G068 = Grupo J → 20:00 CDMX = 2026-06-28T02:00:00Z
// G069/G070 = Grupo K → 17:30 CDMX = 2026-06-27T23:30:00Z
// G071/G072 = Grupo L → 13:00 CDMX = 2026-06-27T19:00:00Z
const FIXES = {
  'G067': '2026-06-28T02:00:00.000Z',
  'G068': '2026-06-28T02:00:00.000Z',
  'G069': '2026-06-27T23:30:00.000Z',
  'G070': '2026-06-27T23:30:00.000Z',
  'G071': '2026-06-27T19:00:00.000Z',
  'G072': '2026-06-27T19:00:00.000Z',
}

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'ld-quiniela-2026-v1')
    .single()

  if (!data) return res.status(404).json({ error: 'Estado no encontrado' })

  const state = data.value
  const log = []

  const newMatches = state.matches.map(m => {
    if (!FIXES[m.id]) return m
    log.push(`${m.id} (${m.home} vs ${m.away}): ${m.kickoff} → ${FIXES[m.id]}`)
    return { ...m, kickoff: FIXES[m.id] }
  })

  const { error } = await supabase
    .from('config')
    .upsert({ key: 'ld-quiniela-2026-v1', value: { ...state, matches: newMatches } }, { onConflict: 'key' })

  if (error) return res.status(500).json({ ok: false, error: 'Supabase upsert failed', details: error })

  return res.status(200).json({ ok: true, changes: log })
}
