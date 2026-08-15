// Dicionário de traduções PT → EN para cartas Yu-Gi-Oh!
// Adicione mais traduções conforme necessário

export const ptToEn = {
  // Monstros clássicos
  "mago negro": "Dark Magician",
  "mago das trevas": "Dark Magician",
  "dragao branco de olhos azuis": "Blue-Eyes White Dragon",
  "dragão branco de olhos azuis": "Blue-Eyes White Dragon",
  "olhos azuis dragao branco": "Blue-Eyes White Dragon",
  "dragao de olhos azuis": "Blue-Eyes White Dragon",
  "dragão de olhos azuis": "Blue-Eyes White Dragon",
  "menina das trevas": "Dark Magician Girl",
  "garota maga das trevas": "Dark Magician Girl",
  "exodia o proibido": "Exodia the Forbidden One",
  "exodia proibido": "Exodia the Forbidden One",
  "braco esquerdo do proibido": "Left Arm of the Forbidden One",
  "braco direito do proibido": "Right Arm of the Forbidden One",
  "perna esquerda do proibido": "Left Leg of the Forbidden One",
  "perna direita do proibido": "Right Leg of the Forbidden One",
  "torso do proibido": "Torso of the Forbidden One",

  // Fusões Olhos Azuis
  "dragao branco supremo de olhos azuis": "Blue-Eyes Ultimate Dragon",
  "dragão branco supremo": "Blue-Eyes Ultimate Dragon",
  "dragao supremo olhos azuis": "Blue-Eyes Ultimate Dragon",
  "dragao shinning olhos azuis": "Blue-Eyes Shining Dragon",

  // Red-Eyes
  "dragao negro de olhos vermelhos": "Red-Eyes Black Dragon",
  "dragão negro de olhos vermelhos": "Red-Eyes Black Dragon",
  "dragao dos olhos vermelhos": "Red-Eyes Black Dragon",
  "dragao metalico olhos vermelhos": "Red-Eyes Black Metal Dragon",

  // Magia / Armadilha populares
  "buraco negro": "Dark Hole",
  "forca do tempo": "Pot of Greed",
  "pote da ganancia": "Pot of Greed",
  "pote da gula": "Pot of Greed",
  "cambio de campo": "Change of Heart",
  "troca de coracao": "Change of Heart",
  "toca de monstro": "Monster Reborn",
  "renascer monstro": "Monster Reborn",
  "ressurreicao de monstro": "Monster Reborn",
  "espelho magico": "Magic Cylinder",
  "cilindro magico": "Magic Cylinder",
  "armadilha buracos": "Trap Hole",
  "armadilha buraco": "Trap Hole",
  "buraco armadilha": "Trap Hole",
  "raio de destruicao": "Raigeki",
  "raigeki raio": "Raigeki",
  "atirador magico": "Magician's Rod",

  // Xyz populares
  "dragao xyz numero 39": "Number 39: Utopia",
  "utopia": "Number 39: Utopia",
  "numero 39 utopia": "Number 39: Utopia",
  "numero 39": "Number 39: Utopia",
  "n39 utopia": "Number 39: Utopia",
  "armadura xyz torpedo": "Armored Xyz",
  "xyz torpedo": "Armored Xyz",

  // Synchro populares
  "dragao estardust": "Stardust Dragon",
  "dragão estardust": "Stardust Dragon",
  "poeira estelar dragao": "Stardust Dragon",
  "poeira estelar": "Stardust Dragon",
  "dragao red nova": "Red Nova Dragon",
  "dragao escarlate": "Scarlight Red Dragon Archfiend",

  // Link
  "aguia chama fantasma": "Firewall Dragon",
  "dragao firewall": "Firewall Dragon",
  "dragão firewall": "Firewall Dragon",

  // Pendulum
  "oddbyes vagabundo": "Odd-Eyes Pendulum Dragon",
  "olho diferente": "Odd-Eyes Pendulum Dragon",
  "dragao olho diferente": "Odd-Eyes Pendulum Dragon",

  // Personagens / Temas
  "cavaleiro sombrio": "Dark Knight",
  "guerreiro das trevas": "Dark Warrior",
  "guerreiro da luz": "Warrior of Light",
  "dragao do caos": "Chaos Dragon",
  "dragão do caos": "Chaos Dragon",
  "caos imperador dragao": "Chaos Emperor Dragon",
  "imperador dragao do caos": "Chaos Emperor Dragon - Envoy of the End",
  "dragao destino caos": "Chaos Destiny Dragon",

  // Ash Blossom & co (meta moderno)
  "flor de cinza": "Ash Blossom & Joyous Spring",
  "cinza flor": "Ash Blossom & Joyous Spring",
  "ash": "Ash Blossom & Joyous Spring",
  "nuvem de tempestade": "Effect Veiler",
  "bloqueador de efeito": "Effect Veiler",
  "maxx c": "Maxx \"C\"",
  "maxx": "Maxx \"C\"",
  "fantasma ogre": "Ghost Ogre & Snow Rabbit",
  "ogre fantasma": "Ghost Ogre & Snow Rabbit",
  "droll e lockbird": "Droll & Lock Bird",
  "pássaro trava": "Droll & Lock Bird",
  "passaro trava": "Droll & Lock Bird",
  "nibiru monstro primitivo": "Nibiru, the Primal Being",
  "nibiru primitivo": "Nibiru, the Primal Being",
  "nibiru": "Nibiru, the Primal Being",

  // Invocação ritualística
  "exodia necross": "Exodia Necross",
  "black luster soldado": "Black Luster Soldier",
  "soldado de luster negro": "Black Luster Soldier",

  // Outros populares
  "dragao ferreo": "Iron Dragon Tiamaton",
  "cavaleiro das trevas": "Dark Knight",
  "monstro do caos": "Chaos Monster",
  "monstro de fusao": "Fusion Monster",
  "monstro sincro": "Synchro Monster",
  "monstro xyz": "Xyz Monster",
  "monstro link": "Link Monster",
  "monstro de pendulo": "Pendulum Monster",
};

/**
 * Remove acentos e normaliza string para comparação
 */
export function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")   // remove pontuação
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tenta traduzir um termo em português para inglês.
 * Retorna null se não encontrar tradução.
 */
export function translatePtToEn(query) {
  const norm = normalize(query);

  // Busca exata
  if (ptToEn[norm]) return ptToEn[norm];

  // Busca parcial — verifica se a chave começa com o termo ou o termo começa com a chave
  for (const [pt, en] of Object.entries(ptToEn)) {
    if (pt.startsWith(norm) || norm.startsWith(pt) || pt.includes(norm) || norm.includes(pt)) {
      return en;
    }
  }

  return null;
}

/**
 * Gera sugestões baseadas no prefixo digitado
 */
export function getSuggestions(query, limit = 5) {
  if (!query || query.trim().length < 2) return [];
  const norm = normalize(query);
  const matches = [];

  for (const [pt, en] of Object.entries(ptToEn)) {
    if (pt.includes(norm) || normalize(en).includes(norm)) {
      matches.push({ pt: pt, en });
    }
    if (matches.length >= limit) break;
  }

  return matches;
}

// Cartas populares para mostrar como sugestão inicial
export const popularCards = [
  { label: "Dark Magician", query: "Dark Magician" },
  { label: "Blue-Eyes White Dragon", query: "Blue-Eyes White Dragon" },
  { label: "Ash Blossom", query: "Ash Blossom" },
  { label: "Mago Negro (PT)", query: "Mago Negro" },
  { label: "Nibiru", query: "Nibiru" },
  { label: "Exodia", query: "Exodia" },
  { label: "Stardust Dragon", query: "Stardust Dragon" },
  { label: "Number 39: Utopia", query: "Number 39" },
];