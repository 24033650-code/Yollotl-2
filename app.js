// ═══════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════
const GAME_COMPONENTS = {
  starcatch: StarCatchGame,
  simon: SimonGame,
  countlearn: CountLearnGame,
  findanimal: FindAnimalGame,
  puzzle: PuzzleGame,
  stroop: StroopGame,
  numspan: NumSpanGame,
  numseq: NumSeqGame,
  tachy: TachyGame,
  nback: NBackGame,
};

const ALL_GAMES = [...CHILD_GAMES, ...ADULT_GAMES];

function App() {
  const [mode, setMode] = useState(null);
  const [screen, setScreen] = useState("modeSelect");
  const [currentGame, setCurrentGame] = useState(null);
  const [results, setResults] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [settings, setSettings] = useState({ scale:"1", speed:"normal", duration:"full" });

  const engine = useGameEngine();
  const { history, save, clear } = useHistory();

  const isChild = mode === "child";

  const updateSetting = useCallback((key, value) => setSettings(prev => ({ ...prev, [key]: value })), []);

  const handleSelectGame = useCallback((id) => {
    engine.reset();
    setCurrentGame(id);
    setScreen("intro");
  }, [engine]);

  const handleGameComplete = useCallback((res) => {
    const info = ALL_GAMES.find(g => g.id === currentGame);
    setResults({ ...res, gameId: currentGame, gameName: info?.name || currentGame, encouragement: engine.encourage() });
    setScreen("results");
  }, [currentGame, engine]);

  const handleSave = useCallback(() => {
    if (results) {
      save({ ...results, patientName, mode });
      setScreen("home");
    }
  }, [results, patientName, mode, save]);

  const gameInfo = currentGame ? { ...ALL_GAMES.find(g => g.id === currentGame), instructions: GAME_INSTRUCTIONS[currentGame] } : null;
  const ActiveGame = currentGame ? GAME_COMPONENTS[currentGame] : null;

  const GameWrapper = () => (
    <div className={isChild ? "child-bg" : ""} style={{ minHeight:"100vh" }}>
      <div className={`header-bar ${isChild ? "header-child" : "header-adult"} no-print`}>
        <Btn onClick={() => setScreen("home")} variant="ghost" size="sm" isChild={isChild}>← Menú</Btn>
        <span style={{ fontFamily:isChild?"'Fredoka One',cursive":"'Playfair Display',serif", fontSize:17, color:isChild?"#6d28d9":"#f59e0b" }}>
          {gameInfo?.icon} {gameInfo?.name}
        </span>
        <span style={{ fontSize:12, padding:"3px 10px", borderRadius:99, background:isChild?"rgba(139,92,246,0.15)":"rgba(217,119,6,0.15)", color:isChild?"#7c3aed":"#f59e0b" }}>
          Niv {engine.difficulty}
        </span>
      </div>
      <div className="screen">
        {ActiveGame && <ActiveGame isChild={isChild} engine={engine} onComplete={handleGameComplete} key={currentGame} />}
      </div>
      <div className={`footer-bar ${isChild?"footer-child":"footer-adult"} no-print`}>{DISCLAIMER}</div>
    </div>
  );

  const scaleStyle = { transform:`scale(${settings.scale})`, transformOrigin:"top center", minHeight:"100vh" };

  return (
    <div style={scaleStyle}>
      {screen === "modeSelect" && <ModeSelectScreen onSelect={(m)=>{ setMode(m); setScreen("home"); }} />}

      {screen === "home" && mode && (
        <HomeScreen isChild={isChild} onSelectGame={handleSelectGame}
          onHistory={()=>setScreen("history")} onSettings={()=>setScreen("settings")}
          onChangeMode={()=>{ setMode(null); setScreen("modeSelect"); }}
          patientName={patientName} setPatientName={setPatientName} />
      )}

      {screen === "intro" && gameInfo && (
        <GameIntro gameInfo={gameInfo} isChild={isChild}
          patientName={patientName} setPatientName={setPatientName}
          onStart={()=>setScreen("game")}
          onBack={()=>setScreen("home")} />
      )}

      {screen === "game" && <GameWrapper />}

      {screen === "results" && results && (
        <div className={isChild?"child-bg":""} style={{ minHeight:"100vh" }}>
          <div className={`header-bar ${isChild?"header-child":"header-adult"} no-print`}>
            <span style={{ fontFamily:isChild?"'Fredoka One',cursive":"'Playfair Display',serif", fontSize:18, color:isChild?"#6d28d9":"#f59e0b" }}>Resultados</span>
          </div>
          <ResultsScreen results={results} isChild={isChild} onSave={handleSave} onBack={()=>setScreen("home")} />
          <div className={`footer-bar ${isChild?"footer-child":"footer-adult"} no-print`}>{DISCLAIMER}</div>
        </div>
      )}

      {screen === "history" && (
        <HistoryScreen history={history} onClear={clear} isChild={isChild} onBack={()=>setScreen("home")} />
      )}

      {screen === "settings" && (
        <SettingsScreen settings={settings} onUpdate={updateSetting} isChild={isChild} onBack={()=>setScreen("home")} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
