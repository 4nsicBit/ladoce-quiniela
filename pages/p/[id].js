import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { supabase } from "../../lib/supabaseClient"

const CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap");
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#5BB8A8;--sand:#C8A96A;--bg:#09090C;--bg2:#111114;--bg3:#16161B;
    --tx:#EDE9E0;--tx2:#8A8680;--tx3:#4E4B47;--red:#D95F5F;
    --fd:"Cormorant Garamond",Georgia,serif;--fb:"DM Sans",system-ui,sans-serif;
  }
  body{background:var(--bg);color:var(--tx);font-family:var(--fb);min-height:100vh;display:flex;align-items:center;justify-content:center;}
  input{background:var(--bg3);border:0.5px solid rgba(255,255,255,0.07);border-radius:10px;color:var(--tx);font-family:var(--fb);font-size:32px;padding:12px;outline:none;width:100%;text-align:center;letter-spacing:12px;}
  input:focus{border-color:var(--teal)}
  button{background:var(--teal);border:none;border-radius:10px;color:#09090C;cursor:pointer;font-family:var(--fb);font-size:15px;font-weight:500;padding:12px 24px;width:100%;margin-top:12px;transition:opacity 0.2s;}
  button:hover{opacity:0.85}
  button:disabled{opacity:0.4;cursor:not-allowed}
`

export default function ParticipantAccess() {
  const router = useRouter()
  const { id } = router.query
  const [participant, setParticipant] = useState(null)
  const [nip, setNip] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchParticipant = async () => {
      const { data, error } = await supabase
        .from("config")
        .select("value")
        .eq("key", "ld-quiniela-2026-v1")
        .single()
      if (data) {
        const state = data.value
        const found = state.participants.find(p => p.id === id)
        if (found) {
          setParticipant(found)
        } else {
          setError("Link invalido. Contacta al administrador.")
        }
      }
      setLoading(false)
    }
    fetchParticipant()
  }, [id])

  const handleAccess = () => {
    if (!participant) { setError("Cargando, intenta de nuevo."); return }
    if (nip.length !== 4) { setError("El NIP debe ser de 4 digitos"); return }
    setChecking(true)
    const nipCorrecto = participant.nip || "1234"
    if (nip === nipCorrecto) {
      localStorage.setItem("ld-participant-id", id)
      localStorage.setItem("ld-participant-name", participant.name)
      localStorage.setItem("ld-session-ts", Date.now().toString())
      router.push("/?participant=" + id)
    } else {
      setError("NIP incorrecto. Intenta de nuevo.")
      setNip("")
      setChecking(false)
    }
  }

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{textAlign:"center",color:"var(--teal)",fontFamily:"var(--fd)",fontSize:18}}>Verificando...</div>
    </>
  )

  if (error && !participant) return (
    <>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"2rem"}}>
        <div style={{fontFamily:"var(--fd)",fontSize:22,color:"var(--teal)",marginBottom:8}}>La Doce - Quiniela</div>
        <div style={{color:"var(--red)",fontSize:14}}>{error}</div>
      </div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:360,padding:"2rem 1.5rem"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:500,color:"var(--teal)",marginBottom:4}}>La Doce</div>
          <div style={{fontSize:11,color:"var(--tx3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"1.5rem"}}>Quiniela Mundial 2026</div>
          <div style={{fontSize:18,color:"var(--tx)",marginBottom:4}}>Hola, <strong>{participant?.name}</strong></div>
          <div style={{fontSize:13,color:"var(--tx3)"}}>Ingresa tu NIP de 4 digitos para acceder</div>
        </div>
        <input
          type="password"
          maxLength={4}
          value={nip}
          onChange={e => { setNip(e.target.value.replace(/\D/g,"")); setError("") }}
          onKeyDown={e => e.key === "Enter" && handleAccess()}
          placeholder="****"
          autoFocus
        />
        {error && <div style={{color:"var(--red)",fontSize:12,textAlign:"center",marginTop:8}}>{error}</div>}
        <button onClick={handleAccess} disabled={nip.length !== 4 || checking}>
          {checking ? "Verificando..." : "Entrar"}
        </button>
        <div style={{textAlign:"center",marginTop:"1.5rem",fontSize:11,color:"var(--tx3)"}}>
          Powered by ForensicBit Solutions
        </div>
      </div>
    </>
  )
}