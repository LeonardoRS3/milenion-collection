import CardThumbnail from "@/components/cards/CardThumbnail";
import { useNavigate } from "react-router-dom";

export default function RecentCards({ cards }) {
  const navigate = useNavigate();

  if (!cards || cards.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma carta na coleção ainda.</p>
        <p className="text-xs text-muted-foreground mt-1">Use a busca para adicionar cartas!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {cards.slice(0, 6).map((card) => (
        <CardThumbnail
          key={card.id}
          card={card}
          showFavorite
          onClick={() => navigate("/collection")}
        />
      ))}
    </div>
  );
}