// ═══════════════════════════════════════════════
// PANTALLAS
// ═══════════════════════════════════════════════
function ModeSelectScreen({ onSelect }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 20px", background:"linear-gradient(135deg,#0a0e1a 0%,#0f172a 50%,#1e1b4b 100%)" }}>
      <div style={{ textAlign:"center", marginBottom:40 }} className="animate-fadeIn">
        <div style={{ fontSize:72, marginBottom:8 }} className="animate-float">🧠</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:52, fontWeight:900, color:"#f59e0b", lineHeight:1.1, marginBottom:8 }}>Yóllotl</h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:16 }}>Plataforma de Evaluación Cognitiva</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16, width:"100%", maxWidth:400 }} className="animate-fadeIn">
        <button onClick={() => onSelect("child")}
          style={{ padding:"24px 28px", borderRadius:22, background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.2))", border:"2px solid rgba(139,92,246,0.35)", cursor:"pointer", textAlign:"left", transition:"all .25s" }}
          onMouseEnter={e => e.currentTarget.style.transform="translateY(-3px)"}
          onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
          <div style={{ fontSize:40, marginBottom:8 }}>🌈 👶</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:"#c4b5fd", marginBottom:4 }}>Modo Infantil</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Visual, colorido y divertido para niños</div>
        </button>

        <button onClick={() => onSelect("adult")}
          style={{ padding:"24px 28px", borderRadius:22, background:"linear-gradient(135deg,rgba(217,119,6,0.1),rgba(59,130,246,0.1))", border:"2px solid rgba(217,119,6,0.25)", cursor:"pointer", textAlign:"left", transition:"all .25s" }}
          onMouseEnter={e => e.currentTarget.style.transform="translateY(-3px)"}
          onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
          <div style={{ fontSize:40, marginBottom:8 }}>🧑‍⚕️</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:"#fbbf24", marginBottom:4 }}>Modo Adulto / Clínico</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Evaluación analítica para adultos y profesionales</div>
        </button>
      </div>

      <p style={{ color:"rgba(255,255,255,0.15)", fontSize:11, textAlign:"center", marginTop:32, maxWidth:340, lineHeight:1.5 }}>{DISCLAIMER}</p>
    </div>
  );
}

function HomeScreen({ isChild, onSelectGame, onHistory, onSettings, onChangeMode, patientName, setPatientName }) {
  const games = isChild ? CHILD_GAMES : ADULT_GAMES;
  const fg = isChild ? "#7c3aed" : "#f59e0b";
  return (
    <div className={isChild ? "child-bg" : ""} style={{ minHeight:"100vh" }}>
      {/* HEADER */}
      <div className={`header-bar ${isChild ? "header-child" : "header-adult"}`}>
        <span style={{ fontFamily: isChild ? "'Fredoka One',cursive" : "'Playfair Display',serif", fontSize:22, fontWeight:900, color: fg }}>Yóllotl</span>
        <div style={{ display:"flex", gap:6 }}>
          <Btn onClick={onHistory}    variant="ghost" size="sm" isChild={isChild} ariaLabel="Historial">📋</Btn>
          <Btn onClick={onSettings}   variant="ghost" size="sm" isChild={isChild} ariaLabel="Configuración">⚙️</Btn>
          <Btn onClick={onChangeMode} variant="ghost" size="sm" isChild={isChild} ariaLabel="Cambiar modo">🔄 Modo</Btn>
        </div>
      </div>

      <div style={{ padding:"20px 18px 0" }}>
        {/* CAMPO NOMBRE */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.5)", marginBottom:6, display:"block" }}>
            {isChild ? "👤 ¿Cómo te llamas?" : "👤 Nombre del paciente"}
          </label>
          <input
            className={isChild ? "input-child" : "input-adult"}
            placeholder={isChild ? "Escribe tu nombre aquí..." : "Nombre completo del paciente..."}
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            aria-label="Nombre del paciente"
          />
        </div>

        <h2 style={{ fontFamily: isChild ? "'Fredoka One',cursive" : "'Playfair Display',serif", fontSize: isChild ? 28 : 22, color: isChild ? "#6d28d9" : "#fff", marginBottom:14 }}>
          {isChild ? "🎮 ¡Elige tu juego!" : "Selecciona una prueba"}
        </h2>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {games.map((g, i) => (
            <button key={g.id} onClick={() => onSelectGame(g.id)}
              className={isChild ? "glass-light" : "glass-dark"}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", cursor:"pointer", border:"none", textAlign:"left", width:"100%", transition:"all .2s", animation:`fadeIn .3s ${i * 0.06}s both` }}
              onMouseEnter={e => e.currentTarget.style.transform="translateX(4px)"}
              onMouseLeave={e => e.currentTarget.style.transform="translateX(0)"}
              aria-label={`Jugar ${g.name}`}>
              <span style={{ fontSize:36 }}>{g.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:16, color: isChild ? "#4c1d95" : "#fff", marginBottom:2 }}>{g.name}</div>
                <div style={{ fontSize:13, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.4)" }}>{g.desc}</div>
              </div>
              <div style={{ fontSize:11, padding:"4px 10px", borderRadius:99, background: isChild ? "rgba(139,92,246,0.15)" : "rgba(217,119,6,0.15)", color: isChild ? "#7c3aed" : "#f59e0b", whiteSpace:"nowrap" }}>{g.domain}</div>
            </button>))}
        </div>
      </div>

      {/* FOOTER */}
      <div className={`footer-bar ${isChild ? "footer-child" : "footer-adult"}`}>{DISCLAIMER}</div>
    </div>
  );
}

function GameIntro({ gameInfo, isChild, patientName, setPatientName, onStart, onBack }) {
  const fg = isChild ? "#6d28d9" : "#f59e0b";
  return (
    <div className={`screen ${isChild ? "child-bg" : ""}`} style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <div className={`header-bar ${isChild ? "header-child" : "header-adult"}`}>
        <Btn onClick={onBack} variant="ghost" size="sm" isChild={isChild}>← Volver</Btn>
        <span style={{ fontFamily: isChild ? "'Fredoka One',cursive" : "'Playfair Display',serif", fontSize:18, color: fg }}>Yóllotl</span>
        <div style={{width:60}}/>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 20px", gap:24 }}>
        <div className="animate-float" style={{ fontSize:80 }}>{gameInfo.icon}</div>

        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily: isChild ? "'Fredoka One',cursive" : "'Playfair Display',serif", fontSize: isChild ? 34 : 28, color: fg, marginBottom:6 }}>
            {gameInfo.name}
          </h2>
          <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background: isChild ? "rgba(139,92,246,0.15)" : "rgba(217,119,6,0.15)", color: isChild ? "#7c3aed" : "#f59e0b" }}>
            {gameInfo.domain}
          </span>
        </div>

        {/* INSTRUCCIONES SIMPLIFICADAS */}
        <div className={isChild ? "glass-light" : "glass-dark"} style={{ padding:"20px 22px", width:"100%", maxWidth:400 }}>
          <p style={{ fontSize:13, fontWeight:700, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>📋 Instrucciones</p>
          <p style={{ fontSize: isChild ? 17 : 15, color: isChild ? "#4c1d95" : "rgba(255,255,255,0.75)", lineHeight:1.65 }}>
            {gameInfo.instructions}
          </p>
        </div>

        {/* NOMBRE DEL PACIENTE */}
        <div style={{ width:"100%", maxWidth:400 }}>
          <label style={{ fontSize:14, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.5)", marginBottom:8, display:"block", fontWeight:600 }}>
            {isChild ? "👤 ¿Cómo te llamas?" : "👤 Nombre del paciente"}
          </label>
          <input
            className={isChild ? "input-child" : "input-adult"}
            placeholder={isChild ? "Escribe tu nombre..." : "Nombre completo del paciente..."}
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            aria-label="Nombre del paciente"
          />
        </div>

        <Btn onClick={onStart} variant="primary" size="xl" isChild={isChild}>
          {isChild ? "¡Jugar! 🚀" : "Comenzar prueba →"}
        </Btn>
      </div>
    </div>
  );
}

function ResultsScreen({ results, isChild, onSave, onBack }) {
  const analysis = useMemo(() => generateClinicalAnalysis(results), [results]);
  const fg = isChild ? "#6d28d9" : "#f59e0b";
  const emoji = results.accuracy > 80 ? "🏆" : results.accuracy > 55 ? "🎯" : "💪";
  const msg = results.accuracy > 80 ? (isChild ? "¡Increíble! ¡Lo lograste!" : "Rendimiento excelente") :
              results.accuracy > 55 ? (isChild ? "¡Bien hecho!" : "Buen desempeño") :
              (isChild ? "¡Sigue practicando!" : "Continúa entrenando");
  return (
    <div className={`screen ${isChild ? "child-bg" : ""}`} style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
      <div className="animate-pop" style={{ fontSize:72, marginBottom:8 }}>{emoji}</div>
      <h2 style={{ fontFamily: isChild ? "'Fredoka One',cursive" : "'Playfair Display',serif", fontSize: isChild ? 32 : 26, color: fg, textAlign:"center", marginBottom:4 }}>{msg}</h2>
      <p style={{ color: isChild ? "#8b5cf6" : "rgba(255,255,255,0.5)", fontStyle:"italic", marginBottom:24, textAlign:"center" }}>{results.encouragement}</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, width:"100%", maxWidth:380, marginBottom:20 }}>
        <MetricBadge label="Precisión" value={`${results.accuracy}%`} color={results.accuracy > 70 ? "#22c55e" : results.accuracy > 50 ? "#f59e0b" : "#ef4444"} isChild={isChild} />
        <MetricBadge label="Puntuación" value={results.score} color={fg} isChild={isChild} />
        <MetricBadge label="TR Promedio" value={results.avgRT > 0 ? `${results.avgRT}ms` : "—"} color="#60a5fa" isChild={isChild} />
        <MetricBadge label="Dificultad Máx." value={`Niv. ${results.maxDifficulty}`} color={isChild ? "#ec4899" : "#fff"} isChild={isChild} />
      </div>

      {!isChild && (
        <div className="glass-dark" style={{ padding:"16px 18px", width:"100%", maxWidth:380, marginBottom:20 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Análisis clínico</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>{analysis}</p>
        </div>
      )}

      <div style={{ display:"flex", gap:10, width:"100%", maxWidth:380 }}>
        <Btn onClick={onSave} variant="primary" size="lg" isChild={isChild} className="flex-1" style={{ flex:1 }}>
          {isChild ? "💾 Guardar" : "Guardar sesión"}
        </Btn>
        <Btn onClick={onBack} variant="secondary" size="lg" isChild={isChild} style={{ flex:1 }}>
          Menú
        </Btn>
      </div>
    </div>
  );
}

function HistoryScreen({ history, onClear, isChild, onBack }) {
  const handlePrint = () => window.print();
  const fg = isChild?"#6d28d9":"#f59e0b";
  return (
    <div className={`screen ${isChild?"child-bg":""}`} style={{ minHeight:"100vh" }}>
      <div className={`header-bar ${isChild?"header-child":"header-adult"} no-print`}>
        <Btn onClick={onBack} variant="ghost" size="sm" isChild={isChild}>← Volver</Btn>
        <span style={{ fontFamily:isChild?"'Fredoka One',cursive":"'Playfair Display',serif", fontSize:18, color:fg }}>Historial</span>
        <div style={{ display:"flex", gap:6 }}>
          <Btn onClick={handlePrint} variant="secondary" size="sm" isChild={isChild}>🖨️</Btn>
          <Btn onClick={onClear} variant="danger" size="sm" isChild={isChild}>🗑️</Btn>
        </div>
      </div>

      {/* PRINT HEADER */}
      <div className="print-only print-header">
        <span style={{ fontSize:36 }}>🧠</span>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900 }}>Yóllotl — Reporte de Evaluación Cognitiva</h1>
          <p style={{ fontSize:12 }}>Fecha: {new Date().toLocaleString("es-MX")}</p>
        </div>
      </div>

      <div style={{ padding:"16px 18px" }}>
        {history.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", opacity:.4 }}>
            <div style={{ fontSize:48, marginBottom:10 }}>📋</div>
            <p style={{ color:isChild?"#7c3aed":"rgba(255,255,255,0.5)" }}>Aún no hay sesiones guardadas.</p>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className={`hist-table ${isChild?"hist-table-child":""}`}>
              <thead>
                <tr>
                  <th style={{ color:fg }}>Fecha</th>
                  <th>Juego</th>
                  <th>Precisión</th>
                  <th>Puntuación</th>
                  <th>TR Promedio</th>
                  <th>Dificultad Máx.</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s,i)=>(
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>{s.gameName}</td>
                    <td>{s.accuracy}%</td>
                    <td>{s.score}</td>
                    <td>{s.avgRT > 0 ? `${s.avgRT}ms` : "—"}</td>
                    <td>Niv. {s.maxDifficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsScreen({ settings, onUpdate, isChild, onBack }) {
  const fg = isChild?"#6d28d9":"#f59e0b";
  return (
    <div className={`screen ${isChild?"child-bg":""}`} style={{ minHeight:"100vh" }}>
      <div className={`header-bar ${isChild?"header-child":"header-adult"}`}>
        <Btn onClick={onBack} variant="ghost" size="sm" isChild={isChild}>← Volver</Btn>
        <span style={{ fontFamily:isChild?"'Fredoka One',cursive":"'Playfair Display',serif", fontSize:18, color:fg }}>Configuración</span>
        <div style={{width:60}}/>
      </div>

      <div style={{ padding:"20px 18px" }}>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:14, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.5)", marginBottom:8, display:"block", fontWeight:600 }}>
            Escala de la interfaz
          </label>
          <div style={{ display:"flex", gap:8 }}>
            {["0.8","1","1.2","1.5"].map(s=>(
              <button key={s} onClick={()=>onUpdate("scale",s)}
                className={`pill ${settings.scale===s ? (isChild?"pill-active-child":"pill-active-adult") : (isChild?"pill-inactive-child":"pill-inactive-adult")}`}
                style={{ flex:1 }}>
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:14, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.5)", marginBottom:8, display:"block", fontWeight:600 }}>
            Velocidad de los juegos
          </label>
          <div style={{ display:"flex", gap:8 }}>
            {["slow","normal","fast"].map(s=>(
              <button key={s} onClick={()=>onUpdate("speed",s)}
                className={`pill ${settings.speed===s ? (isChild?"pill-active-child":"pill-active-adult") : (isChild?"pill-inactive-child":"pill-inactive-adult")}`}
                style={{ flex:1 }}>
                {s === "slow" ? "Lento" : s === "normal" ? "Normal" : "Rápido"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:14, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.5)", marginBottom:8, display:"block", fontWeight:600 }}>
            Duración de las pruebas
          </label>
          <div style={{ display:"flex", gap:8 }}>
            {["short","full","long"].map(d=>(
              <button key={d} onClick={()=>onUpdate("duration",d)}
                className={`pill ${settings.duration===d ? (isChild?"pill-active-child":"pill-active-adult") : (isChild?"pill-inactive-child":"pill-inactive-adult")}`}
                style={{ flex:1 }}>
                {d === "short" ? "Corta" : d === "full" ? "Completa" : "Larga"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}