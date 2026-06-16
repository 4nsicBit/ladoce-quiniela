import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SK = 'ld-quiniela-2026-v1'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { state } = req.body
  if (!state) return res.status(400).json({ error: 'Estado requerido' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere autenticación' })
  }

  let payload
  try {
    payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET)
  } catch {
    await new Promise(r => setTimeout(r, 1500))
    return res.status(401).json({ error: 'Sesión expirada o inválida' })
  }

  try {
    const { data } = await supabase.from('config').select('value').eq('key', SK).single()
    const current = data?.value
    if (!current) return res.status(404).json({ error: 'Estado no encontrado' })

    if (payload.type === 'admin') {
      await supabase.from('config').upsert({ key: SK, value: state }, { onConflict: 'key' })
    } else if (payload.type === 'participant') {
      const participantId = payload.sub
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
      return res.status(401).json({ error: 'Tipo de sesión inválido' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('save-state error:', e)
    return res.status(500).json({ error: 'Error interno' })
  }
}
