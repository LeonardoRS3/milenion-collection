import { base44 } from "@/api/base44Client";

/**
 * Cria um registro no histórico de compras
 * a partir de uma carta adicionada/comprada na coleção.
 *
 * purchase_price = preço por cópia
 * quantity       = quantidade comprada
 * amount         = preço total da compra
 */
export async function createPurchaseFromCard({
  cardId,
  cardName,
  imageUrl,
  quantity,
  purchasePrice,
  date,
  notes = "",
}) {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const safePrice = Math.max(0, Number(purchasePrice) || 0);

  return base44.entities.Purchase.create({
    amount: safePrice * safeQuantity,
    date: date || new Date().toISOString().slice(0, 10),
    store: "",
    description: `Compra de ${cardName}`,
    notes: notes || "",
    cards_purchased: [
      {
        card_id: String(cardId),
        card_name: cardName,
        quantity: safeQuantity,
        image_url: imageUrl || "",
      },
    ],
  });
}