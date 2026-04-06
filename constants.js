// ═══════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════
const DISCLAIMER = "Aviso: Esta es una herramienta de apoyo tecnológico orientada al entrenamiento y la medición reactiva. NO sustituye una evaluación neuropsicológica, diagnóstico o tratamiento médico profesional.";

const ENCOURAGEMENTS = [
  "¡Excelente enfoque!","Tu tiempo de reacción es notable","¡Sigue así!",
  "¡Concentración impecable!","¡Muy bien ejecutado!","¡Tu mente está afilada hoy!",
  "¡Respuesta magistral!","¡Eso es precisión!","¡Rendimiento sobresaliente!"
];

const STROOP_WORDS = [
  { word:"ROJO",    inkColor:"#ef4444", namedColor:"#ef4444", name:"Rojo"    },
  { word:"AZUL",    inkColor:"#3b82f6", namedColor:"#3b82f6", name:"Azul"    },
  { word:"VERDE",   inkColor:"#22c55e", namedColor:"#22c55e", name:"Verde"   },
  { word:"AMARILLO",inkColor:"#eab308", namedColor:"#eab308", name:"Amarillo"},
  { word:"MORADO",  inkColor:"#a855f7", namedColor:"#a855f7", name:"Morado"  },
];
// Para el Stroop: la tinta siempre es un color distinto al significado
const STROOP_ITEMS = [
  { word:"ROJO",     ink:"#3b82f6",  answer:"Rojo"    },
  { word:"AZUL",     ink:"#22c55e",  answer:"Azul"    },
  { word:"VERDE",    ink:"#ef4444",  answer:"Verde"   },
  { word:"AMARILLO", ink:"#a855f7",  answer:"Amarillo"},
  { word:"MORADO",   ink:"#eab308",  answer:"Morado"  },
  { word:"ROJO",     ink:"#a855f7",  answer:"Rojo"    },
  { word:"AZUL",     ink:"#ef4444",  answer:"Azul"    },
  { word:"VERDE",    ink:"#eab308",  answer:"Verde"   },
];

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

const PUZZLE_SEQ = [
  { items:["🌱","🌿","🌳","🍂"], answer:["🌱","🌿","🌳","🍂"], label:"¿Cómo crece el árbol? Ordénalos." },
  { items:["🌑","🌒","🌓","🌕"], answer:["🌑","🌒","🌓","🌕"], label:"¿Cómo cambia la luna? Ordénalos." },
  { items:["🐣","🐥","🐤","🐓"], answer:["🐣","🐥","🐤","🐓"], label:"¿Cómo crece el pollito? Ordénalos." },
  { items:["🌧️","🌱","🌸","🌻"], answer:["🌧️","🌱","🌸","🌻"], label:"¿Cómo crece la flor? Ordénalos." },
];

const CHILD_GAMES = [
  { id:"starcatch",  icon:"⭐", name:"Atrapa la Estrella",  domain:"Motor",    desc:"¡Atrapa las estrellas que caen!" },
  { id:"simon",      icon:"🌈", name:"Memoria de Colores",  domain:"Memoria",  desc:"Repite la secuencia de colores" },
  { id:"countlearn", icon:"🔢", name:"Cuenta y Aprende",    domain:"Números",  desc:"¿Cuántos emojis hay?" },
  { id:"findanimal", icon:"🔍", name:"Encuentra el diferente", domain:"Atención", desc:"Busca el emoji diferente" },
  { id:"puzzle",     icon:"🧩", name:"Ordena el Puzzle",    domain:"Lógica",   desc:"Ordena los emojis correctamente" },
];
const ADULT_GAMES = [
  { id:"stroop",     icon:"🎨", name:"Stroop Test",           domain:"Inhibición", desc:"Controla tu impulso y responde correctamente" },
  { id:"numspan",    icon:"🔑", name:"Span Numérico",          domain:"Memoria",    desc:"Recuerda y escribe la secuencia de números" },
  { id:"numseq",     icon:"📐", name:"Secuencia Numérica",     domain:"Razonamiento",desc:"¿Qué número sigue en el patrón?" },
  { id:"tachy",      icon:"⚡", name:"Tachistoscopio",         domain:"Percepción", desc:"Identifica la figura que parpadea" },
  { id:"nback",      icon:"🔁", name:"N-Back",                domain:"Ejecutivo",  desc:"¿La figura coincide con hace 2 turnos?" },
];

const NUM_SEQS = [
  { seq:[1,2,3,4,"?"],    ans:5,   opts:[4,5,6,7]        },
  { seq:[2,4,6,8,"?"],    ans:10,  opts:[9,10,11,12]     },
  { seq:[3,6,9,12,"?"],   ans:15,  opts:[13,14,15,16]    },
  { seq:[5,10,15,20,"?"], ans:25,  opts:[22,23,25,27]    },
  { seq:[144,72,36,18,"?"], ans:9,   opts:[6,8,9,12]        },
  { seq:[2,3,5,7,11,"?"],      ans:13,  opts:[12,13,14,15]     },
];

const GAME_INSTRUCTIONS = {
  starcatch: "Mueve la barra con el mouse o desliza el dedo para atrapar las estrellas que caen. ¡No dejes que se escapen!",
  simon: "Observa la secuencia de colores que se iluminan. Luego, repítela tocando los botones en el mismo orden.",
  countlearn: "Cuenta los emojis que aparecen en la pantalla y selecciona el número correcto.",
  findanimal: "Encuentra el emoji que es diferente al resto. ¡Busca rápido!",
  puzzle: "Ordena los emojis en la secuencia correcta arrastrándolos o tocándolos.",
  stroop: "Aparecerá una palabra escrita en un color. Presiona el botón del COLOR de la tinta, ignorando lo que dice la palabra.",
  numspan: "Memoriza la secuencia de números que se muestra. Luego, escríbela en el orden correcto.",
  numseq: "Completa la secuencia numérica seleccionando el número que sigue el patrón.",
  tachy: "Una figura aparecerá por un instante. Memorízala y selecciona cuál era de las opciones.",
  nback: "Observa las figuras. Presiona el botón cuando la figura actual sea igual a la de hace 2 turnos.",
};