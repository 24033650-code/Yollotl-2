// ═══════════════════════════════════════════════
// JUEGOS — Yóllotl  (bugs corregidos)
// CORRECCIONES:
//  1. RT tracking: rtRef en lugar de rt state (evita stale closure)
//  2. StarCatch: animateRef pattern (evita stale RAF)
//  3. Simon: eliminado useEffect duplicado
//  4. NBack: scoreRef/errorsRef para cierre final correcto
//  5. Todos: aceptan sessionTotal para duración configurable
// ═══════════════════════════════════════════════

// ───────────────────────────────────────────────
// JUEGO: ATRAPA LA ESTRELLA
// ───────────────────────────────────────────────
function StarCatchGame({ isChild, engine, onComplete, sessionTotal }) {
  const TOTAL = sessionTotal || 10;

  const [barX,    setBarX]    = useState(50);
  const [starPos, setStarPos] = useState({ x: 50, y: -5 });
  const [lives,   setLives]   = useState(3);
  const [score,   setScore]   = useState(0);
  const [caught,  setCaught]  = useState(0);
  const [total,   setTotal]   = useState(0);
  const [feedback,setFeedback]= useState(null);

  const arenaRef  = useRef(null);
  const rafRef    = useRef(null);
  const animateRef= useRef(null);   // ← CORRECCIÓN: ref para función animate
  const starRef   = useRef({ x: 50, y: -5, speed: 0.7 });

  // Estado mutable sin re-render (para el loop de animación)
  const S = useRef({ barX: 50, active: true, lives: 3, score: 0, caught: 0, total: 0 });

  // Sync barX state → ref
  useEffect(() => { S.current.barX = barX; }, [barX]);

  const launchStar = useCallback(() => {
    starRef.current = { x: randInt(10, 90), y: -5, speed: 0.55 + engine.difficulty * 0.22 };
    setStarPos({ x: starRef.current.x, y: -5 });
  }, [engine.difficulty]);

  // ← CORRECCIÓN: animateRef.current siempre apunta a la versión más fresca
  //   evita que el RAF quede atrapado con closures viejas
  animateRef.current = () => {
    if (!S.current.active) return;

    starRef.current.y += starRef.current.speed;
    setStarPos({ x: starRef.current.x, y: starRef.current.y });

    if (starRef.current.y >= 90) {
      const dx  = Math.abs(starRef.current.x - S.current.barX);
      const hit = dx < 12;

      if (hit) {
        S.current.score  += 100 + engine.difficulty * 20;
        S.current.caught += 1;
        setScore(S.current.score);
        setCaught(S.current.caught);
        setFeedback("hit");
        engine.recordResult(true);
      } else {
        S.current.lives -= 1;
        setLives(S.current.lives);
        setFeedback("miss");
        engine.recordResult(false);
      }

      S.current.total += 1;
      setTotal(S.current.total);
      setTimeout(() => setFeedback(null), 400);

      if (S.current.lives <= 0 || S.current.total >= TOTAL) {
        S.current.active = false;
        const acc = Math.round((S.current.caught / S.current.total) * 100);
        setTimeout(() => onComplete({
          score: S.current.score,
          accuracy: acc,
          avgRT: 0,
          errors: S.current.total - S.current.caught,
          maxDifficulty: engine.difficulty
        }), 500);
        return;
      }
      launchStar();
    }
    rafRef.current = requestAnimationFrame(animateRef.current);
  };

  useEffect(() => {
    S.current = { barX: 50, active: true, lives: 3, score: 0, caught: 0, total: 0 };
    launchStar();
    rafRef.current = requestAnimationFrame(animateRef.current);
    return () => {
      cancelAnimationFrame(rafRef.current);
      S.current.active = false;
    };
  }, []); // eslint-disable-line

  const handleMove = useCallback((clientX) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const pct  = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    setBarX(pct);
    S.current.barX = pct;
  }, []);

  return (
    <div style={{ padding: "16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Vidas"     value={[...Array(3)].map((_,i)=>i<lives?"❤️":"🖤").join("")} color={isChild?"#ec4899":"#f59e0b"} isChild={isChild}/>
        <MetricBadge label="Puntos"    value={score}   color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild}/>
        <MetricBadge label="Atrapadas" value={`${caught}/${TOTAL}`} color="#22c55e" isChild={isChild}/>
      </div>
      <ProgressBar value={total} max={TOTAL} isChild={isChild}/>

      <div
        ref={arenaRef}
        className={`star-arena ${isChild ? "star-arena-child" : "star-arena-adult"}`}
        style={{
          marginTop: 12,
          background:
            feedback === "hit"  ? (isChild ? "linear-gradient(180deg,#bbf7d0,#a7f3d0)" : "linear-gradient(180deg,#052e16,#14532d)") :
            feedback === "miss" ? (isChild ? "linear-gradient(180deg,#fecaca,#fca5a5)" : "linear-gradient(180deg,#1c0505,#3f0808)") :
            undefined,
          transition: "background .3s"
        }}
        onMouseMove={e  => handleMove(e.clientX)}
        onTouchMove={e  => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
        onTouchStart={e => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
      >
        <div className="star-el" style={{ left:`${starPos.x}%`, top:`${starPos.y}%`, fontSize: isChild ? 44 : 36 }}>
          {isChild ? "⭐" : "✦"}
        </div>
        <div className={`bar-el ${isChild ? "bar-child" : "bar-adult"}`} style={{ left:`${barX}%`, bottom:16 }}/>
        {feedback === "hit"  && <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", fontSize:48 }}>✨</div>}
        {feedback === "miss" && <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", fontSize:48 }} className="animate-shake">💨</div>}
      </div>

      <p style={{ textAlign:"center", fontSize:13, color: isChild ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.3)", marginTop:10 }}>
        {isChild ? "🖱️ Mueve el ratón o desliza el dedo" : "Mueve el cursor o toca la pantalla"}
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: SIMON (Memoria de colores)
// ───────────────────────────────────────────────
function SimonGame({ isChild, engine, onComplete, sessionTotal }) {
  const MAXROUND = sessionTotal || 8;
  const COLORS   = ["#ef4444","#3b82f6","#22c55e","#eab308"];
  const LABELS   = ["Rojo","Azul","Verde","Amarillo"];

  const [seq,     setSeq]     = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [lit,     setLit]     = useState(-1);
  const [showing, setShowing] = useState(false);
  const [score,   setScore]   = useState(0);
  const [errors,  setErrors]  = useState(0);
  const [round,   setRound]   = useState(0);

  const showSeq = useCallback((s) => {
    setShowing(true);
    setUserSeq([]);
    let i = 0;
    const next = () => {
      if (i >= s.length) { setLit(-1); setShowing(false); return; }
      setLit(s[i]);
      setTimeout(() => { setLit(-1); setTimeout(() => { i++; next(); }, 250); }, 650);
    };
    setTimeout(next, 600);
  }, []);

  const addRound = useCallback((prev) => {
    const ns = [...prev, randInt(0, 3)];
    setSeq(ns);
    showSeq(ns);
  }, [showSeq]);

  // ← CORRECCIÓN: un solo useEffect de inicialización
  useEffect(() => { addRound([]); }, []); // eslint-disable-line

  const handlePress = useCallback((idx) => {
    if (showing) return;
    const nu = [...userSeq, idx];
    setUserSeq(nu);
    setLit(idx);
    setTimeout(() => setLit(-1), 200);

    if (nu[nu.length - 1] !== seq[nu.length - 1]) {
      setErrors(e => e + 1);
      engine.recordResult(false);
      onComplete({ score, accuracy: Math.round((round / Math.max(1, round + 1)) * 100), avgRT: 0, errors: errors + 1, maxDifficulty: engine.difficulty });
      return;
    }
    if (nu.length === seq.length) {
      engine.recordResult(true);
      const ns = score + seq.length * 60;
      setScore(ns);
      const nr = round + 1;
      setRound(nr);
      if (nr >= MAXROUND) onComplete({ score: ns, accuracy: 100, avgRT: 0, errors, maxDifficulty: engine.difficulty });
      else addRound(seq);
    }
  }, [showing, userSeq, seq, score, round, errors, engine, addRound, onComplete, MAXROUND]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ronda"  value={`${round}/${MAXROUND}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild}/>
        <MetricBadge label="Puntos" value={score} color={isChild?"#ec4899":"#fff"} isChild={isChild}/>
        <MetricBadge label="Estado" value={showing?"👀 Observa":"🎯 Tu turno"} color={showing?"#60a5fa":"#22c55e"} isChild={isChild}/>
      </div>
      <ProgressBar value={round} max={MAXROUND} isChild={isChild}/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:20 }}>
        {COLORS.map((c, i) => (
          <button key={i} onClick={() => handlePress(i)} disabled={showing} aria-label={LABELS[i]}
            style={{
              height:120, borderRadius:22, border:"none", cursor:"pointer", background:c,
              opacity: lit === i ? 1 : 0.55,
              transform: lit === i ? "scale(1.12)" : "scale(1)",
              boxShadow: lit === i ? `0 0 36px ${c}` : "0 4px 16px rgba(0,0,0,0.3)",
              transition:"all .12s", fontSize:32, color:"rgba(255,255,255,0.85)", fontWeight:900
            }}>
            {lit === i ? "✓" : ""}
          </button>
        ))}
      </div>
      {!showing && (
        <p style={{ textAlign:"center", marginTop:14, fontSize:14, color: isChild ? "#7c3aed" : "rgba(255,255,255,0.4)" }}>
          Repite la secuencia: {userSeq.length}/{seq.length}
        </p>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: CUENTA Y APRENDE
// ───────────────────────────────────────────────
function CountLearnGame({ isChild, engine, onComplete, sessionTotal }) {
  const TOTAL  = sessionTotal || 10;
  const EMOJIS = ["🍎","🌟","🐶","🦋","🎈","🌸","🍕","🎯","🦄","🍦","🌈","🎪"];

  const [emoji,    setEmoji]    = useState("🍎");
  const [count,    setCount]    = useState(3);
  const [options,  setOptions]  = useState([]);
  const [trial,    setTrial]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [errors,   setErrors]   = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const next = useCallback(() => {
    const e   = pick(EMOJIS);
    const max = Math.min(3 + engine.difficulty * 2, 12);
    const n   = randInt(1, max);
    const opts = new Set([n]);
    while (opts.size < 4) opts.add(randInt(1, max + 2));
    setEmoji(e); setCount(n); setOptions(shuffle([...opts]));
    setFeedback(null); setDisabled(false);
  }, [engine.difficulty]);

  useEffect(() => { next(); }, []); // eslint-disable-line

  const handleAnswer = useCallback((ans) => {
    if (disabled) return;
    setDisabled(true);
    const correct = ans === count;
    engine.recordResult(correct);
    setFeedback(correct ? "correct" : "error");
    const ns = correct ? score + 100 : score;
    const ne = correct ? errors : errors + 1;
    if (correct) setScore(ns); else setErrors(ne);
    const nt = trial + 1; setTrial(nt);
    if (nt >= TOTAL) {
      setTimeout(() => onComplete({ score: ns, accuracy: Math.round(((nt - ne) / nt) * 100), avgRT: 0, errors: ne, maxDifficulty: engine.difficulty }), 800);
    } else {
      setTimeout(next, 900);
    }
  }, [disabled, count, trial, score, errors, engine, next, onComplete, TOTAL]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Pregunta" value={`${trial+1}/${TOTAL}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild}/>
        <MetricBadge label="Puntos"   value={score}  color={isChild?"#ec4899":"#fff"} isChild={isChild}/>
        <MetricBadge label="Errores"  value={errors} color="#ef4444" isChild={isChild}/>
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild}/>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ marginTop:16, minHeight:140, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", alignItems:"center", padding:16, borderRadius:20, background: isChild?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.04)", border:`2px solid ${isChild?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.08)"}`, transition:"all .25s" }}>
        {[...Array(count)].map((_, i) => <span key={i} style={{ fontSize:38 }}>{emoji}</span>)}
      </div>

      <p style={{ textAlign:"center", fontSize:18, fontWeight:700, color: isChild?"#6d28d9":"#fff", margin:"14px 0 12px" }}>
        ¿Cuántos {emoji} ves?
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {options.map((o, i) => (
          <Btn key={i} onClick={() => handleAnswer(o)} disabled={disabled} isChild={isChild} size="lg"
            style={{ fontSize:28, fontWeight:900, height:70 }}>{o}</Btn>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: ENCUENTRA EL DIFERENTE
// ───────────────────────────────────────────────
function FindAnimalGame({ isChild, engine, onComplete, sessionTotal }) {
  const TOTAL = sessionTotal || 10;
  const SIZE  = 16;
  const POOL  = [...ANIMALS_POOL, ...THINGS_POOL];

  const [grid,      setGrid]      = useState([]);
  const [targetIdx, setTargetIdx] = useState(-1);
  const [intruder,  setIntruder]  = useState("");
  const [trial,     setTrial]     = useState(0);
  const [score,     setScore]     = useState(0);
  const [errors,    setErrors]    = useState(0);
  const [found,     setFound]     = useState(false);
  const [wrongIdx,  setWrongIdx]  = useState(-1);

  // ← CORRECCIÓN: rtRef en lugar de rt state
  const rtRef    = useRef([]);
  const startRef = useRef(null);

  const next = useCallback(() => {
    const available = shuffle(POOL);
    const m = available[0];
    let d; do { d = available[randInt(1, available.length - 1)]; } while (d === m);
    const idx = randInt(0, SIZE - 1);
    const g   = Array.from({ length: SIZE }, (_, i) => i === idx ? d : m);
    setIntruder(d); setTargetIdx(idx); setGrid(g); setFound(false); setWrongIdx(-1);
    startRef.current = Date.now();
  }, []);

  useEffect(() => { next(); }, []); // eslint-disable-line

  const handleClick = useCallback((idx) => {
    if (found) return;
    const elapsed = Date.now() - startRef.current;
    const correct = idx === targetIdx;
    setFound(true);
    if (!correct) setWrongIdx(idx);

    // ← CORRECCIÓN: push a ref, no setState
    rtRef.current.push(elapsed);
    engine.recordResult(correct);

    const ns = correct ? score + Math.max(50, 1200 - elapsed) : score;
    const ne = correct ? errors : errors + 1;
    if (correct) setScore(ns); else setErrors(ne);

    const nt = trial + 1; setTrial(nt);
    if (nt >= TOTAL) {
      const avgRT = avgArr(rtRef.current);   // ← CORRECCIÓN: ref siempre fresco
      setTimeout(() => onComplete({ score: ns, accuracy: Math.round(((nt - ne) / nt) * 100), avgRT, errors: ne, maxDifficulty: engine.difficulty }), 800);
    } else {
      setTimeout(next, 900);
    }
  }, [found, targetIdx, trial, score, errors, engine, next, onComplete, TOTAL]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial+1}/${TOTAL}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild}/>
        <MetricBadge label="Puntos" value={score}  color={isChild?"#ec4899":"#fff"} isChild={isChild}/>
        <MetricBadge label="Errores"value={errors} color="#ef4444" isChild={isChild}/>
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, margin:"14px 0 12px", padding:"12px 18px", borderRadius:16, background: isChild?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.07)", border: isChild?"2px solid rgba(139,92,246,0.25)":"1px solid rgba(255,255,255,0.1)" }}>
        <span style={{ fontSize:14, color: isChild?"#7c3aed":"rgba(255,255,255,0.5)", fontWeight:600 }}>🔍 Busca:</span>
        <span style={{ fontSize:44 }}>{intruder}</span>
        <span style={{ fontSize:13, color: isChild?"#7c3aed":"rgba(255,255,255,0.4)" }}>(el diferente)</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
        {grid.map((e, i) => (
          <button key={i} onClick={() => handleClick(i)} disabled={found}
            style={{
              fontSize:38, height:70, borderRadius:14, border:"2px solid transparent",
              background: found && i === targetIdx ? "rgba(34,197,94,0.25)" : found && i === wrongIdx ? "rgba(239,68,68,0.25)" : isChild?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.06)",
              borderColor: found && i === targetIdx ? "#22c55e" : found && i === wrongIdx ? "#ef4444" : "transparent",
              cursor:"pointer", transition:"all .15s", transform: found && i === targetIdx ? "scale(1.12)" : "scale(1)"
            }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: PUZZLE
// ───────────────────────────────────────────────
function PuzzleGame({ isChild, engine, onComplete, sessionTotal }) {
  const USE_SEQS = sessionTotal && sessionTotal < PUZZLE_SEQ.length ? PUZZLE_SEQ.slice(0, sessionTotal) : PUZZLE_SEQ;

  const [trialIdx, setTrialIdx] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [userOrder,setUserOrder]= useState([]);
  const [score,    setScore]    = useState(0);
  const [errors,   setErrors]   = useState(0);
  const [feedback, setFeedback] = useState(null);

  const setup = useCallback((idx) => {
    const t = USE_SEQS[idx % USE_SEQS.length];
    setShuffled(shuffle(t.items));
    setUserOrder([]); setFeedback(null);
  }, [USE_SEQS]);

  useEffect(() => { setup(0); }, []); // eslint-disable-line

  const pick_item = useCallback((item) => {
    if (feedback) return;
    const nu = [...userOrder, item];
    setUserOrder(nu);
    setShuffled(s => s.filter(x => x !== item));

    if (nu.length === USE_SEQS[trialIdx % USE_SEQS.length].items.length) {
      const correct = nu.join("") === USE_SEQS[trialIdx % USE_SEQS.length].answer.join("");
      engine.recordResult(correct);
      setFeedback(correct ? "correct" : "error");
      const ns = correct ? score + 200 : score;
      const ne = correct ? errors : errors + 1;
      if (correct) setScore(ns); else setErrors(ne);
      const nt = trialIdx + 1;
      if (nt >= USE_SEQS.length) {
        setTimeout(() => onComplete({ score: ns, accuracy: Math.round(((nt - ne) / nt) * 100), avgRT: 0, errors: ne, maxDifficulty: engine.difficulty }), 900);
      } else {
        setTimeout(() => { setTrialIdx(nt); setup(nt); }, 1000);
      }
    }
  }, [feedback, userOrder, trialIdx, score, errors, engine, setup, onComplete, USE_SEQS]);

  const cur = USE_SEQS[trialIdx % USE_SEQS.length];
  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Puzzle" value={`${trialIdx+1}/${USE_SEQS.length}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild}/>
        <MetricBadge label="Puntos" value={score} color={isChild?"#ec4899":"#fff"} isChild={isChild}/>
      </div>
      <ProgressBar value={trialIdx} max={USE_SEQS.length} isChild={isChild}/>

      <p style={{ textAlign:"center", fontSize:17, fontWeight:700, color: isChild?"#6d28d9":"#fff", margin:"16px 0 12px", padding:"10px 16px", borderRadius:14, background:isChild?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.06)", border:isChild?"2px solid rgba(139,92,246,0.25)":"1px solid rgba(255,255,255,0.12)" }}>{cur.label}</p>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ minHeight:80, display:"flex", gap:10, justifyContent:"center", alignItems:"center", padding:14, borderRadius:18, border:`2px dashed ${isChild?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.12)"}`, marginBottom:16, transition:"all .25s" }}>
        {userOrder.length === 0
          ? <span style={{ color: isChild?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.2)", fontSize:14 }}>Toca los emojis en orden...</span>
          : userOrder.map((e, i) => <span key={i} style={{ fontSize:42 }}>{e}</span>)}
      </div>

      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        {shuffled.map((e, i) => (
          <button key={i} onClick={() => pick_item(e)} disabled={!!feedback}
            style={{ fontSize:44, width:80, height:80, borderRadius:18, border:`2px solid ${isChild?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.12)"}`, background:isChild?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.07)", cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: STROOP TEST
// ───────────────────────────────────────────────
function StroopGame({ isChild, engine, onComplete, sessionTotal }) {
  const TOTAL = sessionTotal ? sessionTotal * 2 : 20; // doble porque cada trial es rápido

  const [current,  setCurrent]  = useState(null);
  const [trial,    setTrial]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [errors,   setErrors]   = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // ← CORRECCIÓN: rtRef en lugar de rt state
  const rtRef    = useRef([]);
  const startRef = useRef(null);

  const next = useCallback(() => {
    const item = STROOP_ITEMS[randInt(0, STROOP_ITEMS.length - 1)];
    setCurrent(item); setFeedback(null); setDisabled(false);
    startRef.current = Date.now();
  }, []);

  useEffect(() => { next(); }, []); // eslint-disable-line

  const handleAnswer = useCallback((ans) => {
    if (disabled || !current) return;
    setDisabled(true);
    const elapsed = Date.now() - startRef.current;
    const correct = ans === current.answer;

    // ← CORRECCIÓN: push a ref
    rtRef.current.push(elapsed);
    engine.recordResult(correct);
    setFeedback(correct ? "correct" : "error");

    const ns = correct ? score + Math.max(80, 500 - elapsed) : score;
    const ne = correct ? errors : errors + 1;
    if (correct) setScore(ns); else setErrors(ne);

    const nt = trial + 1; setTrial(nt);
    if (nt >= TOTAL) {
      const avgRT = avgArr(rtRef.current); // ← CORRECCIÓN: ref fresco
      setTimeout(() => onComplete({ score: ns, accuracy: Math.round(((TOTAL - ne) / TOTAL) * 100), avgRT, errors: ne, maxDifficulty: engine.difficulty }), 700);
    } else {
      setTimeout(next, 700);
    }
  }, [disabled, current, trial, score, errors, engine, next, onComplete, TOTAL]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial}/${TOTAL}`} color="#fff"     isChild={isChild}/>
        <MetricBadge label="Puntos" value={score}   color="#f59e0b"              isChild={isChild}/>
        <MetricBadge label="Errores"value={errors}  color="#ef4444"              isChild={isChild}/>
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild}/>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ display:"flex", alignItems:"center", justifyContent:"center", height:140, marginTop:16, borderRadius:22, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", transition:"all .2s" }}>
        {current && <span style={{ fontSize:60, fontWeight:900, fontFamily:"'Playfair Display',serif", color:current.ink, userSelect:"none" }}>{current.word}</span>}
      </div>

      <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)", margin:"12px 0 10px" }}>
        Presiona el COLOR DE LA TINTA (ignora lo que dice la palabra)
      </p>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        {STROOP_WORDS.map(sw => (
          <button key={sw.name} onClick={() => handleAnswer(sw.name)} disabled={disabled} aria-label={sw.name}
            style={{ width:56, height:56, borderRadius:14, border:"2px solid rgba(255,255,255,0.15)", background:sw.namedColor, cursor:"pointer", transition:"all .15s", opacity:disabled?0.35:1 }}
            onMouseEnter={e => !disabled && (e.currentTarget.style.transform="scale(1.15)")}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}/>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: SPAN NUMÉRICO
// ───────────────────────────────────────────────
function NumSpanGame({ isChild, engine, onComplete, sessionTotal }) {
  const TOTAL     = sessionTotal || 10;
  const MAX_LEVEL = 8;

  const [level,    setLevel]    = useState(2);
  const [phase,    setPhase]    = useState("show");
  const [sequence, setSequence] = useState([]);
  const [showIdx,  setShowIdx]  = useState(0);
  const [input,    setInput]    = useState("");
  const [trial,    setTrial]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [errors,   setErrors]   = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [levelMsg, setLevelMsg] = useState(null);

  // ← CORRECCIÓN: rtRef
  const rtRef    = useRef([]);
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const launchSeq = useCallback((lvl) => {
    const seq = Array.from({ length: lvl }, () => randInt(1, 9));
    setSequence(seq); setShowIdx(0); setPhase("show"); setInput(""); setFeedback(null);
  }, []);

  useEffect(() => { launchSeq(level); }, []); // eslint-disable-line

  useEffect(() => {
    if (phase !== "show") return;
    timerRef.current = setTimeout(() => {
      if (showIdx < sequence.length - 1) setShowIdx(i => i + 1);
      else { setPhase("input"); startRef.current = Date.now(); }
    }, 900);
    return () => clearTimeout(timerRef.current);
  }, [phase, showIdx, sequence.length]);

  const handleSubmit = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const correct = input === sequence.join("");

    // ← CORRECCIÓN: push a ref
    rtRef.current.push(elapsed);
    engine.recordResult(correct);
    setFeedback(correct ? "correct" : "error");

    let newLevel = level;
    if (correct) {
      setScore(s => s + level * 120);
      if (level < MAX_LEVEL) {
        newLevel = level + 1; setLevel(newLevel);
        setLevelMsg(`¡Nivel ${newLevel}! Ahora ${newLevel} dígitos`);
        setTimeout(() => setLevelMsg(null), 1300);
      }
    } else {
      setErrors(e => e + 1);
      if (level > 2) { newLevel = level - 1; setLevel(newLevel); }
    }

    const nt = trial + 1; setTrial(nt);
    if (nt >= TOTAL) {
      const avgRT = avgArr(rtRef.current); // ← CORRECCIÓN
      setTimeout(() => onComplete({
        score: score + (correct ? level * 120 : 0),
        accuracy: Math.round(((nt - (correct ? errors : errors + 1)) / nt) * 100),
        avgRT, errors: correct ? errors : errors + 1, maxDifficulty: engine.difficulty
      }), 800);
    } else {
      setTimeout(() => launchSeq(newLevel), 1000);
    }
  }, [input, sequence, level, trial, score, errors, engine, launchSeq, onComplete, TOTAL]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial+1}/${TOTAL}`}  color="#fff"    isChild={isChild}/>
        <MetricBadge label="Nivel"  value={`${level} dígitos`}     color="#f59e0b" isChild={isChild}/>
        <MetricBadge label="Puntos" value={score}                   color="#22c55e" isChild={isChild}/>
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild}/>

      {levelMsg && (
        <div className="animate-pop" style={{ textAlign:"center", padding:"8px 16px", borderRadius:14, background:"rgba(217,119,6,0.2)", color:"#fbbf24", fontWeight:700, fontSize:16, margin:"10px 0" }}>
          {levelMsg}
        </div>
      )}

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ width:180, height:180, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:22, margin:"16px auto", border:"2px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", transition:"all .15s" }}>
        {phase === "show"
          ? <span style={{ fontSize:90, fontWeight:900, color:"#fff", fontFamily:"'Playfair Display',serif" }}>{sequence[showIdx]}</span>
          : <span style={{ fontSize:48, color: feedback==="correct"?"#22c55e":feedback==="error"?"#ef4444":"rgba(255,255,255,0.25)", fontWeight:700 }}>
              {feedback==="correct"?"✓":feedback==="error"?"✗":"✎"}
            </span>}
      </div>

      {phase === "input" && !feedback && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>Escribe los {level} números que viste (en orden)</p>
          <input className="input-adult"
            style={{ textAlign:"center", fontSize:28, letterSpacing:"0.35em", maxWidth:260 }}
            type="text" value={input} onChange={e => setInput(e.target.value.replace(/\D/g, ""))}
            maxLength={level} autoFocus placeholder={"_".repeat(level)}
            onKeyDown={e => e.key === "Enter" && input.length === level && handleSubmit()}
            aria-label="Escribe la secuencia numérica"/>
          <Btn onClick={handleSubmit} disabled={input.length !== level} isChild={isChild} size="lg">Confirmar</Btn>
        </div>
      )}
      {phase === "show" && (
        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14, marginTop:8 }} className="animate-pulse">
          Memoriza el número... ({showIdx+1}/{sequence.length})
        </p>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: SECUENCIA NUMÉRICA
// ───────────────────────────────────────────────
function NumSeqGame({ isChild, engine, onComplete, sessionTotal }) {
  const USE_SEQS = NUM_SEQS.slice(0, Math.min(sessionTotal || 10, NUM_SEQS.length));
  const TOTAL    = USE_SEQS.length;

  const [trial,    setTrial]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [errors,   setErrors]   = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // ← CORRECCIÓN: rtRef
  const rtRef    = useRef([]);
  const startRef = useRef(Date.now());

  useEffect(() => { startRef.current = Date.now(); }, [trial]);

  const handleAnswer = useCallback((ans) => {
    if (disabled) return;
    setDisabled(true);
    const elapsed = Date.now() - startRef.current;
    const correct = ans === USE_SEQS[trial].ans;

    // ← CORRECCIÓN: push a ref
    rtRef.current.push(elapsed);
    engine.recordResult(correct);
    setFeedback(correct ? "correct" : "error");

    const ns = correct ? score + Math.max(100, 1200 - elapsed) : score;
    const ne = correct ? errors : errors + 1;
    if (correct) setScore(ns); else setErrors(ne);

    const nt = trial + 1;
    if (nt >= TOTAL) {
      const avgRT = avgArr(rtRef.current); // ← CORRECCIÓN
      setTimeout(() => onComplete({ score: ns, accuracy: Math.round(((TOTAL - ne) / TOTAL) * 100), avgRT, errors: ne, maxDifficulty: engine.difficulty }), 800);
    } else {
      setTimeout(() => { setTrial(nt); setFeedback(null); setDisabled(false); }, 900);
    }
  }, [disabled, trial, score, errors, engine, onComplete, TOTAL, USE_SEQS]);

  const cur = USE_SEQS[trial];
  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Pregunta" value={`${trial+1}/${TOTAL}`} color="#fff"    isChild={isChild}/>
        <MetricBadge label="Puntos"   value={score}   color="#f59e0b"              isChild={isChild}/>
        <MetricBadge label="Errores"  value={errors}  color="#ef4444"              isChild={isChild}/>
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild}/>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ margin:"16px 0 14px", padding:"22px 16px", borderRadius:22, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", textAlign:"center", transition:"all .2s" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, flexWrap:"wrap" }}>
          {cur.seq.map((n, i) => (
            <React.Fragment key={i}>
              <span style={{ fontSize:34, fontWeight:900, color:n==="?"?"#f59e0b":"#fff", fontFamily:"'Playfair Display',serif" }}>{n}</span>
              {i < cur.seq.length - 1 && <span style={{ fontSize:18, color:"rgba(255,255,255,0.2)" }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {cur.opts.map((o, i) => (
          <Btn key={i} onClick={() => handleAnswer(o)} disabled={disabled} isChild={isChild} size="lg"
            style={{ fontSize:24, fontWeight:900, height:66 }}>{o}</Btn>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: TACHISTOSCOPIO
// ───────────────────────────────────────────────
function TachyGame({ isChild, engine, onComplete, sessionTotal }) {
  const TOTAL = sessionTotal ? sessionTotal + 5 : 15;

  const [phase,    setPhase]    = useState("showing");
  const [target,   setTarget]   = useState(null);
  const [options,  setOptions]  = useState([]);
  const [visible,  setVisible]  = useState(true);
  const [trial,    setTrial]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [errors,   setErrors]   = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // ← CORRECCIÓN: rtRef
  const rtRef    = useRef([]);
  const startRef = useRef(null);

  const exposureMs = useMemo(() => [700,500,350,220,150][Math.min(engine.difficulty-1,4)], [engine.difficulty]);

  const runTrial = useCallback(() => {
    const t = pick(SHAPES);
    let opts = [t];
    while (opts.length < 3) { const o = pick(SHAPES); if (!opts.includes(o)) opts.push(o); }
    setTarget(t); setOptions(shuffle(opts));
    setVisible(true); setFeedback(null); setDisabled(false); setPhase("showing");

    setTimeout(() => {
      setVisible(false); setPhase("answering");
      startRef.current = Date.now();
    }, exposureMs);
  }, [exposureMs]);

  useEffect(() => { runTrial(); }, []); // eslint-disable-line

  const handleAnswer = useCallback((sym) => {
    if (disabled || phase !== "answering") return;
    setDisabled(true);
    const elapsed = Date.now() - startRef.current;
    const correct = sym === target;

    // ← CORRECCIÓN: push a ref
    rtRef.current.push(elapsed);
    engine.recordResult(correct);
    setFeedback(correct ? "correct" : "error");

    const ns = correct ? score + 200 : score;
    const ne = correct ? errors : errors + 1;
    if (correct) setScore(ns); else setErrors(ne);

    const nt = trial + 1; setTrial(nt);
    if (nt >= TOTAL) {
      const avgRT = avgArr(rtRef.current); // ← CORRECCIÓN
      setTimeout(() => onComplete({ score: ns, accuracy: Math.round(((TOTAL - ne) / TOTAL) * 100), avgRT, errors: ne, maxDifficulty: engine.difficulty }), 700);
    } else {
      setTimeout(runTrial, 900);
    }
  }, [disabled, phase, target, trial, score, errors, engine, runTrial, onComplete, TOTAL]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial+1}/${TOTAL}`} color="#fff"    isChild={isChild}/>
        <MetricBadge label="Puntos" value={score}   color="#f59e0b"              isChild={isChild}/>
        <MetricBadge label="Expo."  value={`${exposureMs}ms`} color="#60a5fa"   isChild={isChild}/>
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild}/>

      <div className={`tachy-display ${isChild?"tachy-child":"tachy-adult"} ${visible?"tachy-flash":""} ${feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""}`}
        style={{ marginTop:16, marginBottom:14 }}>
        {visible ? target : (phase==="answering" ? "?" : "")}
      </div>

      <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)", marginBottom:14 }}>
        {visible ? "¡Memoriza esta figura!" : "¿Cuál fue la figura?"}
      </p>

      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        {options.map((o, i) => (
          <button key={i} onClick={() => handleAnswer(o)} disabled={disabled || visible}
            style={{
              width:90, height:90, fontSize:56, borderRadius:18,
              border:`2px solid ${feedback&&o===target?"#22c55e":"rgba(255,255,255,0.15)"}`,
              background: feedback&&o===target ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
              cursor:"pointer", transition:"all .15s"
            }}
            onMouseEnter={e => !disabled&&!visible&&(e.currentTarget.style.background="rgba(255,255,255,0.12)")}
            onMouseLeave={e => e.currentTarget.style.background=feedback&&o===target?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)"}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// JUEGO: N-BACK
// ───────────────────────────────────────────────
function NBackGame({ isChild, engine, onComplete, sessionTotal }) {
  const N     = 2;
  const TOTAL = sessionTotal ? sessionTotal * 3 : 25;

  const [seq,       setSeq]       = useState([]);
  const [idx,       setIdx]       = useState(0);
  const [score,     setScore]     = useState(0);
  const [errors,    setErrors]    = useState(0);
  const [responded, setResponded] = useState(false);
  const [feedback,  setFeedback]  = useState(null);

  // ← CORRECCIÓN: refs para evitar stale closures en el setTimeout
  const rtRef      = useRef([]);
  const startRef   = useRef(null);
  const scoreRef   = useRef(0);
  const errorsRef  = useRef(0);
  const activeRef  = useRef(true);

  useEffect(() => {
    const s = Array.from({ length: TOTAL }, () => pick(SHAPES));
    setSeq(s);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!seq.length) return;
    startRef.current = Date.now();
    const speed = engine.getSpeed();

    const timer = setTimeout(() => {
      if (!activeRef.current) return;

      // Penaliza si hubo coincidencia y no respondió
      if (!responded && idx >= N && seq[idx] === seq[idx - N]) {
        errorsRef.current += 1;
        setErrors(errorsRef.current);
        engine.recordResult(false);
      }

      const ni = idx + 1;
      if (ni >= TOTAL) {
        const avgRT = avgArr(rtRef.current); // ← CORRECCIÓN: siempre fresco
        setTimeout(() => onComplete({
          score:         scoreRef.current,    // ← CORRECCIÓN
          accuracy:      Math.round(((TOTAL - errorsRef.current) / TOTAL) * 100),
          avgRT,
          errors:        errorsRef.current,   // ← CORRECCIÓN
          maxDifficulty: engine.difficulty
        }), 300);
        return;
      }
      setIdx(ni); setResponded(false); setFeedback(null);
      startRef.current = Date.now();
    }, speed);

    return () => clearTimeout(timer);
  }, [idx, seq]); // eslint-disable-line

  useEffect(() => () => { activeRef.current = false; }, []);

  const handleMatch = useCallback(() => {
    if (responded || idx < N || !seq.length) return;
    const elapsed   = Date.now() - startRef.current;
    const isMatch   = seq[idx] === seq[idx - N];
    setResponded(true);
    rtRef.current.push(elapsed); // ← CORRECCIÓN

    if (isMatch) {
      scoreRef.current += Math.max(50, 400 - elapsed); // ← CORRECCIÓN
      setScore(scoreRef.current);
      setFeedback("correct");
      engine.recordResult(true);
    } else {
      errorsRef.current += 1; // ← CORRECCIÓN
      setErrors(errorsRef.current);
      setFeedback("error");
      engine.recordResult(false);
    }
  }, [responded, idx, seq, engine]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Puntos" value={score}  color="#f59e0b" isChild={isChild}/>
        <MetricBadge label="Turno"  value={`${idx+1}/${TOTAL}`} color="#fff" isChild={isChild}/>
        <MetricBadge label="Errores"value={errors} color="#ef4444" isChild={isChild}/>
      </div>
      <ProgressBar value={idx} max={TOTAL} isChild={isChild}/>

      <div style={{ display:"flex", justifyContent:"center", gap:10, margin:"14px 0 10px" }}>
        {seq.slice(Math.max(0, idx - 2), idx).map((s, i) => (
          <span key={i} style={{ fontSize:32, opacity: i === 1 ? 0.7 : 0.3 }}>{s}</span>
        ))}
      </div>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ width:180, height:180, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:22, margin:"0 auto 16px", border:"2px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", transition:"all .15s", fontSize:90 }}>
        {seq[idx] || ""}
      </div>

      <Btn onClick={handleMatch} disabled={idx < N} isChild={isChild} size="xl"
        className="btn-primary-adult"
        style={{ width:"100%", maxWidth:360, margin:"0 auto", display:"block" }}>
        ¡COINCIDE con hace {N}!
      </Btn>
      <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:12, marginTop:8 }}>
        Solo presiona si el símbolo es igual al de hace {N} turnos
      </p>
    </div>
  );
}
