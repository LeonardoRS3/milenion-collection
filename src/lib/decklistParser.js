import { translatePtToEn, normalize } from "@/lib/cardTranslations";

/**
 * Faz parse de uma linha de decklist.
 * Formatos aceitos:
 *   "3 Dark Magician"
 *   "3x Dark Magician"
 *   "Dark Magician x3"
 *   "Dark Magician"  (sem quantidade = 1)
 */
export function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Ignorar separadores de seção como "# Main Deck", "---", etc.
  if (/^(#|\/\/|---|===)/.test(trimmed)) return null;

  let qty = 1;
  let name = trimmed;

  // Tenta "3 Nome" ou "3x Nome"
  const startMatch = trimmed.match(/^(\d+)\s*x?\s+(.+)/i);
  if (startMatch) {
    qty = parseInt(startMatch[1], 10);
    name = startMatch[2].trim();
  } else {
    // Tenta "Nome x3"
    const endMatch = trimmed.match(/^(.+?)\s+x(\d+)$/i);
    if (endMatch) {
      name = endMatch[1].trim();
      qty = parseInt(endMatch[2], 10);
    }
  }

  if (!name) return null;

  // Clamp quantidade entre 1 e 99
  qty = Math.min(Math.max(qty, 1), 99);

  // Tradução PT→EN
  const translated = translatePtToEn(name);

  return {
    originalName: name,
    searchName: translated || name,
    translatedFrom: translated ? name : null,
    quantity: qty,
  };
}

/**
 * Faz parse de um bloco de texto inteiro de decklist.
 * Retorna array de { originalName, searchName, translatedFrom, quantity }
 */
export function parseDecklList(text) {
  if (!text?.trim()) return [];
  const lines = text.split("\n");
  const results = [];

  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) results.push(parsed);
  }

  return results;
}

/**
 * Busca uma carta na YGOPRODeck API pelo nome.
 * Retorna o primeiro resultado ou null.
 */
export async function fetchCard(name) {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(name)}&num=5&offset=0`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || json.error || !json.data?.length) return null;
    // Prefere match exato (case-insensitive)
    const exact = json.data.find(
      (c) => normalize(c.name) === normalize(name)
    );
    return exact || json.data[0];
  } catch {
    return null;
  }
}

/**
 * Determina o status de match de uma carta encontrada vs. nome buscado
 */
export function matchStatus(foundCard, searchName) {
  if (!foundCard) return "not_found";
  if (normalize(foundCard.name) === normalize(searchName)) return "exact";
  return "partial";
}