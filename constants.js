// ═══════════════════════════════════════════════
// CONSTANTES GLOBALES — Yóllotl
// ═══════════════════════════════════════════════

const DISCLAIMER = "Aviso: Esta es una herramienta de apoyo tecnológico orientada al entrenamiento y la medición reactiva. NO sustituye una evaluación neuropsicológica, diagnóstico o tratamiento médico profesional.";

const ENCOURAGEMENTS = [
  "¡Excelente enfoque!", "Tu tiempo de reacción es notable", "¡Sigue así!",
  "¡Concentración impecable!", "¡Muy bien ejecutado!", "¡Tu mente está afilada hoy!",
  "¡Respuesta magistral!", "¡Eso es precisión!", "¡Rendimiento sobresaliente!"
];

// ── Duración de sesión → número de intentos por juego ──
const DURATION_TOTALS = { short: 5, medium: 10, long: 15 };

// ── Stroop ──
const STROOP_WORDS = [
  { name: "Rojo",     namedColor: "#ef4444" },
  { name: "Azul",     namedColor: "#3b82f6" },
  { name: "Verde",    namedColor: "#22c55e" },
  { name: "Amarillo", namedColor: "#eab308" },
  { name: "Morado",   namedColor: "#a855f7" },
];
const STROOP_ITEMS = [
  { word: "ROJO",      ink: "#3b82f6", answer: "Rojo"     },
  { word: "AZUL",      ink: "#22c55e", answer: "Azul"     },
  { word: "VERDE",     ink: "#ef4444", answer: "Verde"    },
  { word: "AMARILLO",  ink: "#a855f7", answer: "Amarillo" },
  { word: "MORADO",    ink: "#eab308", answer: "Morado"   },
  { word: "ROJO",      ink: "#a855f7", answer: "Rojo"     },
  { word: "AZUL",      ink: "#ef4444", answer: "Azul"     },
  { word: "VERDE",     ink: "#eab308", answer: "Verde"    },
];

// ── Figuras y animales ──
const SHAPES = ["◆","●","▲","■","★","⬟","⬡","⬢","⊕","⊗","⊞","⊠"];

const ANIMALS_POOL = [
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐸",
  "🐷","🐮","🐙","🦋","🐝","🦄","🐬","🦈","🦆","🦅","🦉","🦚",
  "🦜","🐢","🦎","🐊","🦕","🦖","🐳","🐘","🦒","🦓","🦏","🐃",
  "🐑","🐐","🦌","🐕","🐈","🐇","🦔","🐿","🦦","🦥","🐓","🦃"
];

const THINGS_POOL = [
  "🍎","🍊","🍋","🍇","🍓","🍑","🥝","🍍","🥭","🍒",
  "⚽","🏀","🎾","🏈","⚾","🎱","🏐","🎯","🎳","🏓",
  "🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐"
];

// ── Puzzle ──
const PUZZLE_SEQ = [
  { items: ["🌱","🌿","🌳","🍂"], answer: ["🌱","🌿","🌳","🍂"], label: "¿Cómo crece el árbol? Ordénalos." },
  { items: ["🌑","🌒","🌓","🌕"], answer: ["🌑","🌒","🌓","🌕"], label: "¿Cómo cambia la luna? Ordénalos." },
  { items: ["🐣","🐥","🐤","🐓"], answer: ["🐣","🐥","🐤","🐓"], label: "¿Cómo crece el pollito? Ordénalos." },
  { items: ["🌧️","🌱","🌸","🌻"], answer: ["🌧️","🌱","🌸","🌻"], label: "¿Cómo crece la flor? Ordénalos." },
];

// ── Secuencias numéricas ──
const NUM_SEQS = [
  { seq: [2,4,6,8,"?"],        ans: 10,   opts: [9,10,11,12]       },
  { seq: [1,3,6,10,"?"],       ans: 15,   opts: [13,14,15,16]      },
  { seq: [100,50,25,"?"],      ans: 12.5, opts: [10,12.5,13,15]    },
  { seq: [2,6,18,54,"?"],      ans: 162,  opts: [108,148,162,180]  },
  { seq: [1,4,9,16,"?"],       ans: 25,   opts: [20,24,25,30]      },
  { seq: [3,7,15,31,"?"],      ans: 63,   opts: [47,55,63,71]      },
  { seq: [5,10,20,40,"?"],     ans: 80,   opts: [60,70,80,90]      },
  { seq: [1,1,2,3,5,"?"],      ans: 8,    opts: [6,7,8,9]          },
  { seq: [144,72,36,18,"?"],   ans: 9,    opts: [6,8,9,12]         },
  { seq: [2,3,5,7,11,"?"],     ans: 13,   opts: [12,13,14,15]      },
];

// ── Catálogos de juegos ──
const CHILD_GAMES = [
  { id: "starcatch",  icon: "⭐", name: "Atrapa la Estrella",      domain: "Motor",    desc: "¡Atrapa las estrellas que caen!" },
  { id: "simon",      icon: "🌈", name: "Memoria de Colores",      domain: "Memoria",  desc: "Repite la secuencia de colores" },
  { id: "countlearn", icon: "🔢", name: "Cuenta y Aprende",        domain: "Números",  desc: "¿Cuántos emojis hay?" },
  { id: "findanimal", icon: "🔍", name: "Encuentra el diferente",  domain: "Atención", desc: "Busca el emoji diferente" },
  { id: "puzzle",     icon: "🧩", name: "Ordena el Puzzle",        domain: "Lógica",   desc: "Ordena los emojis correctamente" },
];
const ADULT_GAMES = [
  { id: "stroop",   icon: "🎨", name: "Stroop Test",         domain: "Inhibición",    desc: "Controla tu impulso y responde" },
  { id: "numspan",  icon: "🔑", name: "Span Numérico",       domain: "Memoria",       desc: "Recuerda y escribe los números" },
  { id: "numseq",   icon: "📐", name: "Secuencia Numérica",  domain: "Razonamiento",  desc: "¿Qué número sigue en el patrón?" },
  { id: "tachy",    icon: "⚡", name: "Tachistoscopio",      domain: "Percepción",    desc: "Identifica la figura que parpadea" },
  { id: "nback",    icon: "🔁", name: "N-Back",              domain: "Ejecutivo",     desc: "¿La figura coincide con hace 2 turnos?" },
];

// ── Instrucciones por juego ──
const GAME_INSTRUCTIONS = {
  starcatch:  "Una estrella cae desde arriba. Mueve el ratón o desliza el dedo para mover la barra y ¡atraparla! Tienes 3 vidas. Si se te escapa 3 veces, el juego termina.",
  simon:      "Se iluminarán colores uno por uno. Cuando terminen, repite la misma secuencia tocando los colores en el mismo orden. ¡Cada ronda agrega un color más!",
  countlearn: "Verás varios emojis en pantalla. Cuéntalos con calma y toca el número correcto.",
  findanimal: "Hay un emoji diferente escondido entre muchos iguales. Arriba te mostramos cuál buscar. ¡Tócalo lo más rápido que puedas!",
  puzzle:     "Verás emojis en desorden. Tócalos uno por uno en el orden correcto (por ejemplo: de pequeño a grande, o de primero a último).",
  stroop:     "Verás una palabra de color. IGNORA lo que dice la palabra. Presiona el círculo del COLOR DE LA TINTA. Ejemplo: si dice ROJO pero está pintada de azul, presiona el círculo azul.",
  numspan:    "Aparecerán números uno por uno. Cuando terminen, escríbelos en el mismo orden. ¡Empieza con 2 números y va aumentando!",
  numseq:     "Hay una secuencia de números con un patrón. Encuéntralo y elige qué número falta al final.",
  tachy:      "Una figura aparecerá muy brevemente. Luego verás 3 opciones. Elige cuál fue la figura que viste. ¡Pon mucha atención!",
  nback:      "Verás figuras una por una. Presiona el botón SOLO cuando la figura actual sea IGUAL a la de hace 2 turnos. Ejemplo: si hace 2 turnos fue ◆ y ahora vuelve ◆, ¡presiona!",
};

// ── Utilidades ──
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function avgArr(arr) { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0; }

function generateClinicalAnalysis({ accuracy, avgRT, maxDifficulty, errors }) {
  const attn = accuracy > 85 ? "Alta" : accuracy > 60 ? "Media" : "Baja";
  const proc = avgRT > 0 ? (avgRT < 400 ? "Sobresaliente" : avgRT < 700 ? "Normal" : "Por debajo del promedio") : "—";
  const ctrl = errors < 3 ? "Adecuado" : errors < 7 ? "Moderado" : "Requiere atención";
  return `Atención: ${attn}. Velocidad de procesamiento: ${proc}${avgRT > 0 ? ` (TR promedio: ${avgRT}ms)` : ""}. ` +
    `Control inhibitorio: ${ctrl} (${errors} errores). Dificultad máxima: Nivel ${maxDifficulty}/5. ` +
    (accuracy > 85 && (avgRT === 0 || avgRT < 600) ? "Rendimiento dentro de rangos óptimos." :
     accuracy < 50 ? "Se recomienda evaluación complementaria con especialista." :
     "Rendimiento dentro de parámetros esperados.");
}
