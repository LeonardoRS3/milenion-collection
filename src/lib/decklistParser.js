import { translatePtToEn, normalize } from "@/lib/cardTranslations";

/**
 * Detecta uma seção da decklist.
 *
 * Retorna:
 *   "main"
 *   "extra"
 *   "side"
 *   null
 */
export function parseSectionHeader(line) {
  const text = line
    .trim()
    .replace(/^#+\s*/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

  if (!text) return null;

  if (
    /^(main|main deck|deck principal|deck principal de cartas)$/.test(text)
  ) {
    return "main";
  }

  if (
    /^(extra|extra deck|deck extra)$/.test(text)
  ) {
    return "extra";
  }

  if (
    /^(side|side deck|deck lateral|lateral)$/.test(text)
  ) {
    return "side";
  }

  return null;
}

/**
 * Detecta uma seção escrita na própria linha da carta.
 *
 * Exemplos aceitos:
 *
 *   Dark Magician → Main
 *   Dark Magician -> Main
 *   Dark Magician - Main
 *   Dark Magician main
 *   Dark Magician Main Deck
 *
 *   Xyz Armor Fortress → Extra
 *   Xyz Armor Fortress extra
 *   Xyz Armor Fortress Extra Deck
 *
 *   Dark Magician → Side
 *   Dark Magician side
 *   Dark Magician Side Deck
 *
 * Retorna:
 *   { name, section }
 * ou
 *   null
 */
export function parseInlineSection(line) {
  if (!line?.trim()) return null;

  let text = line.trim();

  // Remove separadores comuns entre o nome e a seção.
  text = text
    .replace(/\s*(?:→|->|—|–)\s*/g, " ")
    .replace(/\s+-\s+/g, " ")
    .trim();

  const sectionMatch = text.match(
    /^(.*?)\s+(main(?:\s+deck)?|extra(?:\s+deck)?|side(?:\s+deck)?|deck\s+principal|deck\s+extra|deck\s+lateral|lateral)$/i
  );

  if (!sectionMatch) return null;

  const name = sectionMatch[1].trim();
  const sectionText = sectionMatch[2].trim().toLowerCase();

  if (!name) return null;

  let section = null;

  if (
    /^(main|main deck|deck principal)$/.test(sectionText)
  ) {
    section = "main";
  } else if (
    /^(extra|extra deck|deck extra)$/.test(sectionText)
  ) {
    section = "extra";
  } else if (
    /^(side|side deck|deck lateral|lateral)$/.test(sectionText)
  ) {
    section = "side";
  }

  if (!section) return null;

  return {
    name,
    section,
  };
}

/**
 * Faz parse de uma linha de decklist.
 *
 * Formatos aceitos:
 *
 *   "3 Dark Magician"
 *   "3x Dark Magician"
 *   "Dark Magician x3"
 *   "Dark Magician"
 *
 * Também aceita seção na própria linha:
 *
 *   "Dark Magician → Main"
 *   "Dark Magician -> Extra"
 *   "Dark Magician main"
 *   "Dark Magician Side Deck"
 */
export function parseLine(line, section = null) {
  const trimmed = line.trim();

  if (!trimmed) return null;

  // Ignorar separadores
  if (/^(#|\/\/|---|===)/.test(trimmed)) return null;

  // Ignorar cabeçalhos de seção
  if (parseSectionHeader(trimmed)) return null;

  // Primeiro tenta descobrir se a própria linha informa a seção.
  const inlineSection = parseInlineSection(trimmed);

  let workingLine = trimmed;
  let lineSection = section;

  if (inlineSection) {
    workingLine = inlineSection.name;
    lineSection = inlineSection.section;
  }

  let qty = 1;
  let name = workingLine;

  // "3 Nome" ou "3x Nome"
  const startMatch = workingLine.match(/^(\d+)\s*x?\s+(.+)/i);

  if (startMatch) {
    qty = parseInt(startMatch[1], 10);
    name = startMatch[2].trim();
  } else {
    // "Nome x3"
    const endMatch = workingLine.match(/^(.+?)\s+x(\d+)$/i);

    if (endMatch) {
      name = endMatch[1].trim();
      qty = parseInt(endMatch[2], 10);
    }
  }

  if (!name) return null;

  // Mantém limite técnico para evitar quantidades absurdas.
  qty = Math.min(Math.max(qty, 1), 99);

  const translated = translatePtToEn(name);

  return {
    originalName: name,
    searchName: translated || name,
    translatedFrom: translated ? name : null,
    quantity: qty,
    section: lineSection,
  };
}

/**
 * Faz parse de um bloco inteiro.
 *
 * A seção atual é mantida até aparecer uma nova seção.
 *
 * A seção escrita na própria linha da carta tem prioridade
 * sobre a seção atual do bloco.
 */
export function parseDecklList(text) {
  if (!text?.trim()) return [];

  const lines = text.split("\n");
  const results = [];

  let currentSection = null;

  for (const line of lines) {
    const detectedSection = parseSectionHeader(line);

    if (detectedSection) {
      currentSection = detectedSection;
      continue;
    }

    const parsed = parseLine(line, currentSection);

    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Verifica se a carta pertence ao Extra Deck.
 */
function isExtraDeckCard(card) {
  const type = String(card?.type || "").toLowerCase();

  return (
    type.includes("fusion monster") ||
    type.includes("synchro monster") ||
    type.includes("xyz monster") ||
    type.includes("link monster")
  );
}

/**
 * Ajusta a seção com base no tipo REAL da carta.
 *
 * Regras:
 *
 * - Extra Deck:
 *   Fusion, Synchro, Xyz e Link pertencem ao Extra Deck.
 *
 * - Se o usuário pediu Main para uma carta do Extra:
 *   corrige automaticamente para Extra.
 *
 * - Se o usuário pediu Extra para uma carta que NÃO é do Extra:
 *   corrige automaticamente para Main.
 *
 * - Se o usuário pediu Side:
 *   mantém Side.
 *
 * - Se nenhuma seção foi informada:
 *   sugere Extra para cartas do Extra Deck
 *   e Main para as demais.
 */
export function suggestDeckSection(card, explicitSection = null) {
  const isExtra = isExtraDeckCard(card);

  // Se o usuário pediu Side, respeitamos.
  if (explicitSection === "side") {
    return "side";
  }

  // Se pediu Main, mas a carta pertence ao Extra,
  // corrigimos para Extra.
  if (explicitSection === "main") {
    return isExtra ? "extra" : "main";
  }

  // Se pediu Extra, mas a carta não pertence ao Extra,
  // corrigimos para Main.
  if (explicitSection === "extra") {
    return isExtra ? "extra" : "main";
  }

  // Nenhuma seção foi informada:
  // decide automaticamente pelo tipo da carta.
  return isExtra ? "extra" : "main";
}

/**
 * Nome amigável da seção.
 */
export function getSectionLabel(section) {
  if (section === "extra") return "Extra Deck";
  if (section === "side") return "Side Deck";
  return "Main Deck";
}

/**
 * Busca uma carta na YGOPRODeck API pelo nome.
 */
export async function fetchCard(name) {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(
    name
  )}&num=5&offset=0`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok || json.error || !json.data?.length) {
      return null;
    }

    const exact = json.data.find(
      (c) => normalize(c.name) === normalize(name)
    );

    return exact || json.data[0];
  } catch {
    return null;
  }
}

/**
 * Determina o status do match.
 */
export function matchStatus(foundCard, searchName) {
  if (!foundCard) return "not_found";

  if (
    normalize(foundCard.name) === normalize(searchName)
  ) {
    return "exact";
  }

  return "partial";
}