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
 * Faz parse de uma linha de decklist.
 *
 * Formatos aceitos:
 *   "3 Dark Magician"
 *   "3x Dark Magician"
 *   "Dark Magician x3"
 *   "Dark Magician"  -> quantidade 1
 */
export function parseLine(line, section = null) {
  const trimmed = line.trim();

  if (!trimmed) return null;

  // Ignorar separadores
  if (/^(#|\/\/|---|===)/.test(trimmed)) return null;

  // Ignorar cabeçalhos de seção
  if (parseSectionHeader(trimmed)) return null;

  let qty = 1;
  let name = trimmed;

  // "3 Nome" ou "3x Nome"
  const startMatch = trimmed.match(/^(\d+)\s*x?\s+(.+)/i);

  if (startMatch) {
    qty = parseInt(startMatch[1], 10);
    name = startMatch[2].trim();
  } else {
    // "Nome x3"
    const endMatch = trimmed.match(/^(.+?)\s+x(\d+)$/i);

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
    section,
  };
}

/**
 * Faz parse de um bloco inteiro.
 *
 * A seção atual é mantida até aparecer uma nova seção.
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
 * Sugere a seção com base no tipo da carta.
 *
 * Fusion / Synchro / Xyz / Link pertencem ao Extra Deck.
 *
 * Outras cartas ficam no Main Deck por padrão.
 */
export function suggestDeckSection(card, explicitSection = null) {
  // Se o usuário informou uma seção, ela tem prioridade.
  if (explicitSection) {
    return explicitSection;
  }

  const type = String(card?.type || "").toLowerCase();

  if (
    type.includes("fusion monster") ||
    type.includes("synchro monster") ||
    type.includes("xyz monster") ||
    type.includes("link monster")
  ) {
    return "extra";
  }

  return "main";
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