// ═══════════════════════════════════════════════
// JUEGOS
// ═══════════════════════════════════════════════
function StarCatchGame({ isChild, engine, onComplete }) {
  const [barX, setBarX] = useState(50);
  const [starPos, setStarPos] = useState({ x: 50, y: -5 });
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [active, setActive] = useState(true);
  const TOTAL = 15;
  const arenaRef = useRef(null);
  const stateRef = useRef({ barX: 50, active: true, lives: 3, score: 0, caught: 0, missed: 0, total: 0 });
  const rafRef = useRef(null);
  const starRef = useRef({ x: 50, y: -5, speed: 0.7 });

  useEffect(() => { stateRef.current.barX = barX; }, [barX]);

  const launchStar = useCallback(() => {
    starRef.current = { x: randInt(8, 92), y: -5, speed: 0.6 + engine.difficulty * 0.25 };
    setStarPos({ x: starRef.current.x, y: -5 });
  }, [engine.difficulty]);

  const animate = useCallback(() => {
    if (!stateRef.current.active) return;
    starRef.current.y += starRef.current.speed;
    setStarPos({ x: starRef.current.x, y: starRef.current.y });

    if (starRef.current.y >= 90) {
      const dx = Math.abs(starRef.current.x - stateRef.current.barX);
      const hit = dx < 11;
      if (hit) {
        stateRef.current.score += 100 + engine.difficulty * 20;
        stateRef.current.caught++;
        setScore(stateRef.current.score);
        setCaught(stateRef.current.caught);
        setFeedback("hit");
        engine.recordResult(true);
      } else {
        stateRef.current.lives--;
        stateRef.current.missed++;
        setLives(stateRef.current.lives);
        setMissed(stateRef.current.missed);
        setFeedback("miss");
        engine.recordResult(false);
      }

      stateRef.current.total++;
      setTotal(stateRef.current.total);
      setTimeout(() => setFeedback(null), 350);

      if (stateRef.current.lives <= 0 || stateRef.current.total >= TOTAL) {
        stateRef.current.active = false;
        setActive(false);
        const acc = Math.round((stateRef.current.caught / stateRef.current.total) * 100);
        setTimeout(() => onComplete({ score: stateRef.current.score, accuracy: acc, avgRT: 0, errors: stateRef.current.missed, maxDifficulty: engine.difficulty }), 500);
        return;
      }
      launchStar();
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [engine, launchStar, onComplete]);

  useEffect(() => {
    launchStar();
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); stateRef.current.active = false; };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const pct = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    setBarX(pct);
    stateRef.current.barX = pct;
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const pct = Math.max(8, Math.min(92, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
    setBarX(pct);
    stateRef.current.barX = pct;
  }, []);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Vidas" value={[...Array(3)].map((_,i)=>i<lives?"❤️":"🖤").join("")} color={isChild?"#ec4899":"#f59e0b"} isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild} />
        <MetricBadge label="Atrapadas" value={`${caught}/${TOTAL}`} color="#22c55e" isChild={isChild} />
      </div>
      <ProgressBar value={total} max={TOTAL} isChild={isChild} />

      <div ref={arenaRef}
        className={`star-arena ${isChild ? "star-arena-child" : "star-arena-adult"}`}
        style={{ marginTop:12, background: feedback === "hit" ? (isChild ? "linear-gradient(180deg,#bbf7d0,#a7f3d0)" : "linear-gradient(180deg,#052e16,#14532d)") : feedback === "miss" ? (isChild ? "linear-gradient(180deg,#fecaca,#fca5a5)" : "linear-gradient(180deg,#1c0505,#3f0808)") : undefined, transition:"background .3s" }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}>

        <div className="star-el" style={{ left:`${starPos.x}%`, top:`${starPos.y}%`, fontSize: isChild ? 44 : 36 }}>
          {isChild ? "⭐" : "✦"}
        </div>

        <div className={`bar-el ${isChild ? "bar-child" : "bar-adult"}`}
          style={{ left:`${barX}%`, bottom:16 }} />

        {feedback === "hit"  && <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", fontSize:48, animation:"pop .3s ease" }}>✨</div>}
        {feedback === "miss" && <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", fontSize:48, animation:"shake .4s ease" }}>💨</div>}
      </div>
      <p style={{ textAlign:"center", fontSize:13, color: isChild ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.3)", marginTop:10 }}>
        {isChild ? "🖱️ Mueve el ratón o desliza el dedo" : "Mueve el cursor para controlar la barra"}
      </p>
    </div>
  );
}

function SimonGame({ isChild, engine, onComplete }) {
  const COLORS = ["#ef4444","#3b82f6","#22c55e","#eab308"];
  const LABELS = ["Rojo","Azul","Verde","Amarillo"];
  const [seq, setSeq] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [lit, setLit] = useState(-1);
  const [showing, setShowing] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [round, setRound] = useState(0);
  const MAXROUND = 8;

  const showSeq = useCallback((s) => {
    setShowing(true); setUserSeq([]);
    let i = 0;
    const next = () => {
      if (i >= s.length) { setLit(-1); setShowing(false); return; }
      setLit(s[i]);
      setTimeout(() => { setLit(-1); setTimeout(() => { i++; next(); }, 250); }, 700);
    };
    setTimeout(next, 600);
  }, []);

  useEffect(() => { showSeq([]); }, []);

  const addRound = useCallback((prev) => {
    const ns = [...prev, randInt(0,3)];
    setSeq(ns); showSeq(ns);
  }, [showSeq]);

  useEffect(() => { addRound([]); }, []);

  const handlePress = useCallback((idx) => {
    if (showing) return;
    const nu = [...userSeq, idx];
    setUserSeq(nu);
    setLit(idx); setTimeout(() => setLit(-1), 200);

    if (nu[nu.length-1] !== seq[nu.length-1]) {
      setErrors(e=>e+1); engine.recordResult(false);
      onComplete({ score, accuracy: Math.round((round / Math.max(1,round+1))*100), avgRT:0, errors:errors+1, maxDifficulty:engine.difficulty });
      return;
    }
    if (nu.length === seq.length) {
      engine.recordResult(true);
      const ns = score + seq.length * 60;
      setScore(ns);
      const nr = round+1;
      setRound(nr);
      if (nr >= MAXROUND) onComplete({ score:ns, accuracy:100, avgRT:0, errors, maxDifficulty:engine.difficulty });
      else addRound(seq);
    }
  }, [showing, userSeq, seq, score, round, errors, engine, addRound, onComplete]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ronda" value={`${round}/${MAXROUND}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color={isChild?"#ec4899":"#fff"} isChild={isChild} />
        <MetricBadge label="Estado" value={showing?"👀 Observa":"🎯 Tu turno"} color={showing?"#60a5fa":"#22c55e"} isChild={isChild} />
      </div>
      <ProgressBar value={round} max={MAXROUND} isChild={isChild} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:20 }}>
        {COLORS.map((c,i)=>(
          <button key={i} onClick={()=>handlePress(i)} disabled={showing}
            aria-label={LABELS[i]}
            style={{ height:120, borderRadius:22, border:"none", cursor:"pointer", background:c,
              opacity: lit===i ? 1 : 0.55, transform: lit===i ? "scale(1.12)" : "scale(1)",
              boxShadow: lit===i ? `0 0 36px ${c}` : "0 4px 16px rgba(0,0,0,0.3)",
              transition:"all .12s", fontSize:32, color:"rgba(255,255,255,0.85)", fontWeight:900 }}>
            {lit===i ? "✓" : ""}
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

function CountLearnGame({ isChild, engine, onComplete }) {
  const EMOJIS = ["🍎","🌟","🐶","🦋","🎈","🌸","🍕","🎯","🦄","🍦","🌈","🎪"];
  const [emoji, setEmoji] = useState("🍎");
  const [count, setCount] = useState(3);
  const [options, setOptions] = useState([]);
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const TOTAL = 10;

  const next = useCallback(() => {
    const e = pick(EMOJIS);
    const max = Math.min(3 + engine.difficulty * 2, 12);
    const n = randInt(1, max);
    const opts = new Set([n]);
    while (opts.size < 4) opts.add(randInt(1, max + 2));
    setEmoji(e); setCount(n); setOptions(shuffle([...opts]));
    setFeedback(null); setDisabled(false);
  }, [engine.difficulty]);

  useEffect(() => { next(); }, []);

  const handleAnswer = useCallback((ans) => {
    if (disabled) return;
    setDisabled(true);
    const correct = ans === count;
    engine.recordResult(correct);
    setFeedback(correct ? "correct" : "error");
    if (correct) setScore(s => s + 100); else setErrors(e => e + 1);
    const nt = trial + 1; setTrial(nt);
    if (nt >= TOTAL) setTimeout(() => onComplete({ score: score + (correct ? 100 : 0), accuracy: Math.round(((nt - errors - (correct ? 0 : 1)) / nt) * 100), avgRT: 0, errors: errors + (correct ? 0 : 1), maxDifficulty: engine.difficulty }), 800);
    else setTimeout(next, 900);
  }, [disabled, count, trial, score, errors, engine, next, onComplete]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Pregunta" value={`${trial+1}/${TOTAL}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color={isChild?"#ec4899":"#fff"} isChild={isChild} />
        <MetricBadge label="Errores" value={errors} color="#ef4444" isChild={isChild} />
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild} />

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ marginTop:16, minHeight:140, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", alignItems:"center", padding:16, borderRadius:20, background: isChild?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.04)", border:`2px solid ${isChild?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.08)"}`, transition:"all .25s" }}>
        {[...Array(count)].map((_,i)=><span key={i} style={{ fontSize:38 }}>{emoji}</span>)}
      </div>

      <p style={{ textAlign:"center", fontSize:18, fontWeight:700, color: isChild?"#6d28d9":"#fff", margin:"14px 0 12px" }}>
        ¿Cuántos {emoji} ves?
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {options.map((o,i)=>(
          <Btn key={i} onClick={()=>handleAnswer(o)} disabled={disabled} isChild={isChild} size="lg"
            style={{ fontSize:28, fontWeight:900, height:70 }}>{o}</Btn>
        ))}
      </div>
    </div>
  );
}

function FindAnimalGame({ isChild, engine, onComplete }) {
  const POOL = [...ANIMALS_POOL, ...THINGS_POOL];
  const [grid, setGrid] = useState([]);
  const [targetIdx, setTargetIdx] = useState(-1);
  const [intruder, setIntruder] = useState("");
  const [main, setMain] = useState("");
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rt, setRt] = useState([]);
  const [found, setFound] = useState(false);
  const [wrongIdx, setWrongIdx] = useState(-1);
  const TOTAL = 10;
  const SIZE = 16;
  const startRef = useRef(null);

  const next = useCallback(() => {
    const available = shuffle(POOL);
    const m = available[0];
    let d;
    do { d = available[randInt(1, available.length-1)]; } while(d===m);
    const idx = randInt(0, SIZE-1);
    const g = Array.from({length:SIZE},(_,i)=>i===idx?d:m);
    setMain(m); setIntruder(d); setTargetIdx(idx);
    setGrid(g); setFound(false); setWrongIdx(-1);
    startRef.current = Date.now();
  }, []);

  useEffect(() => { next(); }, []);

  const handleClick = useCallback((idx) => {
    if (found) return;
    const elapsed = Date.now() - startRef.current;
    const correct = idx === targetIdx;
    setFound(true);
    if (!correct) setWrongIdx(idx);
    setRt(r=>[...r,elapsed]);
    engine.recordResult(correct);
    if (correct) setScore(s=>s+Math.max(50,1200-elapsed));
    else setErrors(e=>e+1);
    const nt=trial+1; setTrial(nt);
    if (nt>=TOTAL) {
      const avgRT=avgArr([...rt,elapsed]);
      setTimeout(()=>onComplete({score:score+(correct?Math.max(50,1200-elapsed):0),accuracy:Math.round(((nt-errors-(correct?0:1))/nt)*100),avgRT,errors:errors+(correct?0:1),maxDifficulty:engine.difficulty}),800);
    } else setTimeout(next,900);
  }, [found, targetIdx, trial, score, errors, rt, engine, next, onComplete]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial+1}/${TOTAL}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color={isChild?"#ec4899":"#fff"} isChild={isChild} />
        <MetricBadge label="Errores" value={errors} color="#ef4444" isChild={isChild} />
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild} />

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, margin:"14px 0 12px", padding:"12px 18px", borderRadius:16, background: isChild?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.07)", border: isChild?"2px solid rgba(139,92,246,0.25)":"1px solid rgba(255,255,255,0.1)" }}>
        <span style={{ fontSize:14, color: isChild?"#7c3aed":"rgba(255,255,255,0.5)", fontWeight:600 }}>🔍 Busca:</span>
        <span style={{ fontSize:44 }}>{intruder}</span>
        <span style={{ fontSize:13, color: isChild?"#7c3aed":"rgba(255,255,255,0.4)" }}>(el diferente)</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
        {grid.map((e,i)=>(
          <button key={i} onClick={()=>handleClick(i)} disabled={found}
            style={{ fontSize:38, height:70, borderRadius:14, border:"2px solid transparent",
              background: found && i===targetIdx ? "rgba(34,197,94,0.25)" : found && i===wrongIdx ? "rgba(239,68,68,0.25)" : isChild?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.06)",
              borderColor: found && i===targetIdx ? "#22c55e" : found && i===wrongIdx ? "#ef4444" : "transparent",
              cursor:"pointer", transition:"all .15s", transform: found&&i===targetIdx?"scale(1.12)":"scale(1)" }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function PuzzleGame({ isChild, engine, onComplete }) {
  const [trialIdx, setTrialIdx] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const setup = useCallback((idx) => {
    const t = PUZZLE_SEQ[idx % PUZZLE_SEQ.length];
    setShuffled(shuffle(t.items));
    setUserOrder([]); setFeedback(null);
  }, []);

  useEffect(() => { setup(0); }, []);

  const pick_item = useCallback((item) => {
    if (feedback) return;
    const nu = [...userOrder, item];
    setUserOrder(nu);
    setShuffled(s => s.filter(x => x !== item));

    if (nu.length === PUZZLE_SEQ[trialIdx % PUZZLE_SEQ.length].items.length) {
      const correct = nu.join("") === PUZZLE_SEQ[trialIdx % PUZZLE_SEQ.length].answer.join("");
      engine.recordResult(correct);
      setFeedback(correct ? "correct" : "error");
      if (correct) setScore(s=>s+200); else setErrors(e=>e+1);
      const nt = trialIdx+1;
      if (nt >= PUZZLE_SEQ.length) {
        setTimeout(()=>onComplete({score:score+(correct?200:0),accuracy:Math.round(((nt-errors-(correct?0:1))/nt)*100),avgRT:0,errors:errors+(correct?0:1),maxDifficulty:engine.difficulty}),900);
      } else setTimeout(()=>{ setTrialIdx(nt); setup(nt); },1000);
    }
  }, [feedback, userOrder, trialIdx, score, errors, engine, setup, onComplete]);

  const cur = PUZZLE_SEQ[trialIdx % PUZZLE_SEQ.length];
  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Puzzle" value={`${trialIdx+1}/${PUZZLE_SEQ.length}`} color={isChild?"#6d28d9":"#f59e0b"} isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color={isChild?"#ec4899":"#fff"} isChild={isChild} />
      </div>
      <ProgressBar value={trialIdx} max={PUZZLE_SEQ.length} isChild={isChild} />

      <p style={{ textAlign:"center", fontSize:17, fontWeight:700, color: isChild?"#6d28d9":"#fff", margin:"16px 0 12px", padding:"10px 16px", borderRadius:14, background:isChild?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.06)", border:isChild?"2px solid rgba(139,92,246,0.25)":"1px solid rgba(255,255,255,0.12)" }}>{cur.label}</p>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ minHeight:80, display:"flex", gap:10, justifyContent:"center", alignItems:"center", padding:14, borderRadius:18, border:`2px dashed ${isChild?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.12)"}`, marginBottom:16, transition:"all .25s" }}>
        {userOrder.length===0 ? <span style={{ color: isChild?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.2)", fontSize:14 }}>Toca los emojis en orden...</span>
          : userOrder.map((e,i)=><span key={i} style={{ fontSize:42 }}>{e}</span>)}
      </div>

      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        {shuffled.map((e,i)=>(
          <button key={i} onClick={()=>pick_item(e)} disabled={!!feedback}
            style={{ fontSize:44, width:80, height:80, borderRadius:18, border:`2px solid ${isChild?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.12)"}`, background:isChild?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.07)", cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function StroopGame({ isChild, engine, onComplete }) {
  const [current, setCurrent] = useState(null);
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rt, setRt] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const TOTAL = 20;
  const startRef = useRef(null);

  const next = useCallback(() => {
    const item = STROOP_ITEMS[randInt(0,STROOP_ITEMS.length-1)];
    setCurrent(item); setFeedback(null); setDisabled(false);
    startRef.current = Date.now();
  }, []);

  useEffect(() => { next(); }, []);

  const handleAnswer = useCallback((ans) => {
    if (disabled) return;
    setDisabled(true);
    const elapsed = Date.now() - startRef.current;
    const correct = ans === current.answer;
    setRt(r=>[...r,elapsed]); engine.recordResult(correct);
    setFeedback(correct?"correct":"error");
    if (correct) setScore(s=>s+Math.max(80,500-elapsed)); else setErrors(e=>e+1);
    const nt=trial+1; setTrial(nt);
    if (nt>=TOTAL) { const avg=avgArr([...rt,elapsed]); setTimeout(()=>onComplete({score,accuracy:Math.round(((TOTAL-errors-(correct?0:1))/TOTAL)*100),avgRT:avg,errors:errors+(correct?0:1),maxDifficulty:engine.difficulty}),700); }
    else setTimeout(next,700);
  }, [disabled, current, trial, score, errors, rt, engine, next, onComplete]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial}/${TOTAL}`} color="#fff" isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color="#f59e0b" isChild={isChild} />
        <MetricBadge label="Errores" value={errors} color="#ef4444" isChild={isChild} />
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild} />

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ display:"flex", alignItems:"center", justifyContent:"center", height:140, marginTop:16, borderRadius:22, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", transition:"all .2s" }}>
        {current && <span style={{ fontSize:60, fontWeight:900, fontFamily:"'Playfair Display',serif", color:current.ink, userSelect:"none" }}>{current.word}</span>}
      </div>

      <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)", margin:"12px 0 10px" }}>Presiona el botón con el COLOR DE LA TINTA (ignora lo que dice la palabra)</p>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        {STROOP_WORDS.map(sw=>(
          <button key={sw.name} onClick={()=>handleAnswer(sw.name)} disabled={disabled}
            aria-label={sw.name}
            style={{ width:56, height:56, borderRadius:14, border:"2px solid rgba(255,255,255,0.15)", background:sw.namedColor, cursor:"pointer", transition:"all .15s", opacity:disabled?0.35:1 }}
            onMouseEnter={e=>!disabled&&(e.currentTarget.style.transform="scale(1.15)")}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"} />
        ))}
      </div>
    </div>
  );
}

function NumSpanGame({ isChild, engine, onComplete }) {
  const [level, setLevel] = useState(2);
  const [phase, setPhase] = useState("show");
  const [sequence, setSequence] = useState([]);
  const [showIdx, setShowIdx] = useState(0);
  const [input, setInput] = useState("");
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rt, setRt] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [levelMsg, setLevelMsg] = useState(null);
  const TOTAL = 10;
  const MAX_LEVEL = 8;
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const launchSeq = useCallback((lvl) => {
    const seq = Array.from({length:lvl},()=>randInt(1,9));
    setSequence(seq); setShowIdx(0); setPhase("show"); setInput(""); setFeedback(null);
  }, []);

  useEffect(() => { launchSeq(level); }, []);

  useEffect(() => {
    if (phase !== "show") return;
    timerRef.current = setTimeout(() => {
      if (showIdx < sequence.length - 1) setShowIdx(i=>i+1);
      else {
        setPhase("input");
        startRef.current = Date.now();
      }
    }, 900);
    return () => clearTimeout(timerRef.current);
  }, [phase, showIdx, sequence.length]);

  const handleSubmit = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const correct = input === sequence.join("");
    setRt(r=>[...r,elapsed]); engine.recordResult(correct);
    setFeedback(correct?"correct":"error");

    let newLevel = level;
    if (correct) {
      setScore(s=>s+level*120);
      if (level < MAX_LEVEL) {
        newLevel = level + 1;
        setLevel(newLevel);
        setLevelMsg(`¡Nivel ${newLevel}! +${level} dígitos`);
        setTimeout(() => setLevelMsg(null), 1200);
      }
    } else {
      setErrors(e=>e+1);
      if (level > 2) { newLevel = level - 1; setLevel(newLevel); }
    }

    const nt=trial+1; setTrial(nt);
    if (nt>=TOTAL) {
      const avg=avgArr([...rt,elapsed]);
      setTimeout(()=>onComplete({score:score+(correct?level*120:0),accuracy:Math.round(((nt-errors-(correct?0:1))/nt)*100),avgRT:avg,errors:errors+(correct?0:1),maxDifficulty:engine.difficulty}),800);
    } else {
      setTimeout(()=>launchSeq(newLevel),1000);
    }
  }, [input, sequence, level, trial, score, errors, rt, engine, launchSeq, onComplete]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial+1}/${TOTAL}`} color="#fff" isChild={isChild} />
        <MetricBadge label="Nivel" value={`${level} dígitos`} color="#f59e0b" isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color="#22c55e" isChild={isChild} />
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild} />

      {levelMsg && (
        <div className="animate-pop" style={{ textAlign:"center", padding:"8px 16px", borderRadius:14, background:"rgba(217,119,6,0.2)", color:"#fbbf24", fontWeight:700, fontSize:16, margin:"10px 0" }}>
          {levelMsg}
        </div>
      )}

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ width:180, height:180, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:22, margin:"16px auto", border:"2px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", transition:"all .15s" }}>
        {phase==="show" ? (
          <span style={{ fontSize:90, fontWeight:900, color:"#fff", fontFamily:"'Playfair Display',serif" }}>
            {sequence[showIdx]}
          </span>
        ) : (
          <span style={{ fontSize:48, color: feedback==="correct"?"#22c55e":feedback==="error"?"#ef4444":"rgba(255,255,255,0.25)", fontWeight:700 }}>
            {feedback==="correct"?"✓":feedback==="error"?"✗":"✎"}
          </span>
        )}
      </div>

      {phase==="input" && !feedback && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>Escribe los {level} números que viste (en orden)</p>
          <input className="input-adult" style={{ textAlign:"center", fontSize:28, letterSpacing:"0.35em", maxWidth:260 }}
            type="text" value={input} onChange={e=>setInput(e.target.value.replace(/\D/g,""))}
            maxLength={level} autoFocus
            placeholder={"_".repeat(level)}
            onKeyDown={e=>e.key==="Enter"&&input.length===level&&handleSubmit()}
            aria-label="Escribe la secuencia numérica" />
          <Btn onClick={handleSubmit} disabled={input.length!==level} isChild={isChild} size="lg">Confirmar</Btn>
        </div>
      )}

      {phase==="show" && (
        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14, marginTop:8 }} className="animate-pulse">
          Memoriza el número... ({showIdx+1}/{sequence.length})
        </p>
      )}
    </div>
  );
}

function NumSeqGame({ isChild, engine, onComplete }) {
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rt, setRt] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const TOTAL = NUM_SEQS.length;
  const startRef = useRef(Date.now());

  useEffect(() => { startRef.current = Date.now(); }, [trial]);

  const handleAnswer = useCallback((ans) => {
    if (disabled) return;
    setDisabled(true);
    const elapsed = Date.now() - startRef.current;
    const correct = ans === NUM_SEQS[trial].ans;
    setRt(r=>[...r,elapsed]); engine.recordResult(correct);
    setFeedback(correct?"correct":"error");
    if (correct) setScore(s=>s+Math.max(100,1200-elapsed)); else setErrors(e=>e+1);
    const nt=trial+1;
    if (nt>=TOTAL) {
      const avg=avgArr([...rt,elapsed]);
      setTimeout(()=>onComplete({score,accuracy:Math.round(((TOTAL-errors-(correct?0:1))/TOTAL)*100),avgRT:avg,errors:errors+(correct?0:1),maxDifficulty:engine.difficulty}),800);
    } else setTimeout(()=>{ setTrial(nt); setFeedback(null); setDisabled(false); },900);
  }, [disabled, trial, score, errors, rt, engine, onComplete]);

  const cur = NUM_SEQS[trial];
  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Pregunta" value={`${trial+1}/${TOTAL}`} color="#fff" isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color="#f59e0b" isChild={isChild} />
        <MetricBadge label="Errores" value={errors} color="#ef4444" isChild={isChild} />
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild} />

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ margin:"16px 0 14px", padding:"22px 16px", borderRadius:22, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", textAlign:"center", transition:"all .2s" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, flexWrap:"wrap" }}>
          {cur.seq.map((n,i)=>(
            <React.Fragment key={i}>
              <span style={{ fontSize:34, fontWeight:900, color:n==="?"?"#f59e0b":"#fff", fontFamily:"'Playfair Display',serif", animation:n==="?"?"pulse 1.2s infinite":undefined }}>{n}</span>
              {i<cur.seq.length-1&&<span style={{ fontSize:18, color:"rgba(255,255,255,0.2)" }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {cur.opts.map((o,i)=>(
          <Btn key={i} onClick={()=>handleAnswer(o)} disabled={disabled} isChild={isChild} size="lg"
            style={{ fontSize:24, fontWeight:900, height:66 }}>{o}</Btn>
        ))}
      </div>
    </div>
  );
}

function TachyGame({ isChild, engine, onComplete }) {
  const [phase, setPhase] = useState("showing");
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [visible, setVisible] = useState(true);
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rt, setRt] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const TOTAL = 15;
  const startRef = useRef(null);

  const exposureMs = useMemo(() => [700,500,350,220,150][Math.min(engine.difficulty-1,4)], [engine.difficulty]);

  const runTrial = useCallback(() => {
    const t = pick(SHAPES);
    let opts = [t];
    while (opts.length < 3) { const o = pick(SHAPES); if (!opts.includes(o)) opts.push(o); }
    setTarget(t); setOptions(shuffle(opts));
    setVisible(true); setFeedback(null); setDisabled(false); setPhase("showing");
    setCountdown(null);

    setTimeout(() => {
      setVisible(false);
      setPhase("answering");
      startRef.current = Date.now();
    }, exposureMs);
  }, [exposureMs]);

  useEffect(() => { runTrial(); }, []);

  const handleAnswer = useCallback((sym) => {
    if (disabled || phase !== "answering") return;
    setDisabled(true);
    const elapsed = Date.now() - startRef.current;
    const correct = sym === target;
    setRt(r=>[...r,elapsed]); engine.recordResult(correct);
    setFeedback(correct?"correct":"error");
    if (correct) setScore(s=>s+200); else setErrors(e=>e+1);
    const nt=trial+1; setTrial(nt);
    if (nt>=TOTAL) { const avg=avgArr([...rt,elapsed]); setTimeout(()=>onComplete({score,accuracy:Math.round(((TOTAL-errors-(correct?0:1))/TOTAL)*100),avgRT:avg,errors:errors+(correct?0:1),maxDifficulty:engine.difficulty}),700); }
    else setTimeout(runTrial,900);
  }, [disabled, phase, target, trial, score, errors, rt, engine, runTrial, onComplete]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Ensayo" value={`${trial+1}/${TOTAL}`} color="#fff" isChild={isChild} />
        <MetricBadge label="Puntos" value={score} color="#f59e0b" isChild={isChild} />
        <MetricBadge label="Expo." value={`${exposureMs}ms`} color="#60a5fa" isChild={isChild} />
      </div>
      <ProgressBar value={trial} max={TOTAL} isChild={isChild} />

      <div className={`tachy-display ${isChild?"tachy-child":"tachy-adult"} ${visible?"tachy-flash":""} ${feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""}`}
        style={{ marginTop:16, marginBottom:14 }}>
        {visible ? target : (phase==="answering" ? "?" : "")}
      </div>

      <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)", marginBottom:14 }}>
        {visible ? "¡Memoriza esta figura!" : "¿Cuál fue la figura?"}
      </p>

      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        {options.map((o,i)=>(
          <button key={i} onClick={()=>handleAnswer(o)} disabled={disabled||visible}
            style={{ width:90, height:90, fontSize:56, borderRadius:18,
              border:`2px solid ${feedback&&o===target?"#22c55e":feedback&&o!==target?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.15)"}`,
              background: feedback&&o===target?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)",
              cursor:"pointer", transition:"all .15s", opacity:disabled&&o!==target&&o!==options[0]?0.5:1 }}
            onMouseEnter={e=>!disabled&&!visible&&(e.currentTarget.style.background="rgba(255,255,255,0.12)")}
            onMouseLeave={e=>e.currentTarget.style.background=feedback&&o===target?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)"}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function NBackGame({ isChild, engine, onComplete }) {
  const N = 2;
  const [seq, setSeq] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [rt, setRt] = useState([]);
  const [responded, setResponded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const TOTAL = 25;
  const startRef = useRef(null);
  const activeRef = useRef(true);

  useEffect(() => {
    const s = Array.from({length:TOTAL},()=>pick(SHAPES));
    setSeq(s);
  }, []);

  useEffect(() => {
    if (!seq.length) return;
    startRef.current = Date.now();
    const speed = engine.getSpeed();
    const timer = setTimeout(() => {
      if (!activeRef.current) return;
      if (!responded && idx >= N && seq[idx]===seq[idx-N]) {
        setErrors(e=>e+1); engine.recordResult(false);
      }
      const ni = idx+1;
      if (ni >= TOTAL) {
        const avg=avgArr(rt);
        setTimeout(()=>onComplete({score,accuracy:Math.round(((TOTAL-errors)/TOTAL)*100),avgRT:avg,errors,maxDifficulty:engine.difficulty}),300);
        return;
      }
      setIdx(ni); setResponded(false); setFeedback(null);
      startRef.current = Date.now();
    }, speed);
    return () => clearTimeout(timer);
  }, [idx, seq]);

  useEffect(() => { return () => { activeRef.current=false; }; }, []);

  const handleMatch = useCallback(() => {
    if (responded || idx < N || !seq.length) return;
    const elapsed = Date.now()-startRef.current;
    const isMatch = seq[idx]===seq[idx-N];
    setResponded(true);
    setRt(r=>[...r,elapsed]);
    if (isMatch) { setScore(s=>s+Math.max(50,400-elapsed)); setFeedback("correct"); engine.recordResult(true); }
    else { setErrors(e=>e+1); setFeedback("error"); engine.recordResult(false); }
  }, [responded, idx, seq, engine]);

  return (
    <div style={{ padding:"16px 18px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <MetricBadge label="Puntos" value={score} color="#f59e0b" isChild={isChild} />
        <MetricBadge label="Turno" value={`${idx+1}/${TOTAL}`} color="#fff" isChild={isChild} />
        <MetricBadge label="Errores" value={errors} color="#ef4444" isChild={isChild} />
      </div>
      <ProgressBar value={idx} max={TOTAL} isChild={isChild} />

      <div style={{ display:"flex", justifyContent:"center", gap:10, margin:"14px 0 10px" }}>
        {seq.slice(Math.max(0,idx-2),idx).map((s,i)=>(
          <span key={i} style={{ fontSize:32, opacity: i===1?0.7:0.3 }}>{s}</span>
        ))}
      </div>

      <div className={feedback==="correct"?"feedback-correct":feedback==="error"?"feedback-error":""} style={{ width:180, height:180, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:22, margin:"0 auto 16px", border:"2px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", transition:"all .15s", fontSize:90 }}>
        {seq[idx] || ""}
      </div>

      <Btn onClick={handleMatch} disabled={idx<N} isChild={isChild} size="xl" className="btn-primary-adult"
        style={{ width:"100%", maxWidth:360, margin:"0 auto", display:"block" }}>
        ¡COINCIDE con hace {N}!
      </Btn>
      <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:12, marginTop:8 }}>
        Solo presiona si el símbolo es igual al de hace {N} turnos
      </p>
    </div>
  );
}
