import CardThumbnail from "@/components/cards/CardThumbnail";

export default function CollectionCardItem({ card, onClick }) {
  return <CardThumbnail card={card} onClick={onClick} showPrice showFavorite />;
}