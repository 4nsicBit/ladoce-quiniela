import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("pages/p/[id].js", encoding="utf-8") as f:
    content = f.read()

old = """  const handleAccess = () => {
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
  }"""

new = """  const handleAccess = async () => {
    if (nip.length !== 4) { setError("El NIP debe ser de 4 digitos"); return }
    setChecking(true)
    try {
      const res = await fetch("/api/validate-nip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: id, nip })
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        localStorage.setItem("ld-participant-id", id)
        localStorage.setItem("ld-participant-name", data.name)
        localStorage.setItem("ld-session-ts", Date.now().toString())
        router.push("/?participant=" + id)
      } else {
        setError(data.error || "NIP incorrecto. Intenta de nuevo.")
        setNip("")
        setChecking(false)
      }
    } catch(e) {
      setError("Error de conexion. Intenta de nuevo.")
      setNip("")
      setChecking(false)
    }
  }"""

print("Fix handleAccess:", "OK" if old in content else "NO ENCONTRADO")
content = content.replace(old, new)

with open("pages/p/[id].js", "w", encoding="utf-8") as f:
    f.write(content)
