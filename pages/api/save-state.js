import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SK = 'ld-quiniela-2026-v1'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { state, adminPin, participantId, nip } = req.body
  if (!state) return res.status(400).json({ error: 'Estado requerido' })

  try {
    const { data } = await supabase.from('config').select('value').eq('key', SK).single()
    const current = data?.value
    if (!current) return res.status(404).json({ error: 'Estado no encontrado' })

    if (adminPin) {
      if (!process.env.ADMIN_PIN || adminPin !== process.env.ADMIN_PIN) {
        await new Promise(r => setTimeout(r, 1500))
        return res.status(401).json({ error: 'PIN incorrecto' })
      }
      await supabase.from('config').upsert({ key: SK, value: state }, { onConflict: 'key' })
    } else if (participantId && nip) {
      const participant = current.participants?.find(p => p.id === participantId)
      if (!participant || nip !== (participant.nip || '1234')) {
        await new Promise(r => setTimeout(r, 1500))
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }
      const currentPreds = current.predictions?.[participantId]
      const newPreds = state.predictions?.[participantId]
      if (JSON.stringify(currentPreds) === JSON.stringify(newPreds)) {
        return res.status(200).json({ ok: true, changed: false })
      }
      const safeState = {
        ...current,
        predictions: { ...current.predictions, [participantId]: newPreds }
      }
      await supabase.from('config').upsert({ key: SK, value: safeState }, { onConflict: 'key' })
    } else {
      return res.status(401).json({ error: 'Se requiere autenticación' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('save-state error:', e)
    return res.status(500).json({ error: 'Error interno' })
  }
}
