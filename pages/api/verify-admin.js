import jwt from 'jsonwebtoken'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { pin } = req.body
  if (!pin) return res.status(400).json({ error: 'PIN requerido' })
  if (!process.env.ADMIN_PIN) return res.status(500).json({ error: 'ADMIN_PIN no configurado' })
  if (pin !== process.env.ADMIN_PIN) {
    await new Promise(r => setTimeout(r, 1500))
    return res.status(401).json({ error: 'PIN incorrecto' })
  }
  const token = jwt.sign(
    { type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  )
  return res.status(200).json({ ok: true, token })
}
