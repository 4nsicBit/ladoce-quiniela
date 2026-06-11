import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { participantId, nip } = req.body
  if (!participantId || !nip) return res.status(400).json({ error: 'Faltan datos' })

  try {
    const { data } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'ld-quiniela-2026-v1')
      .single()

    if (!data) return res.status(404).json({ error: 'Estado no encontrado' })

    const state = data.value
    const participant = state.participants.find(p => p.id === participantId)

    if (!participant) return res.status(404).json({ error: 'Participante no encontrado' })

    const nipCorrecto = participant.nip || '1234'
    if (nip !== nipCorrecto) return res.status(401).json({ error: 'NIP incorrecto' })

    return res.status(200).json({ ok: true, name: participant.name })
  } catch (e) {
    return res.status(500).json({ error: 'Error interno' })
  }
}
