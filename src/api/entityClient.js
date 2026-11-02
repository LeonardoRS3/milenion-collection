
import { supabase } from '@/api/supabaseClient';

const entityMap = {
  CollectionCard: 'collection_cards',
  WishlistCard: 'wishlist_cards',
  Deck: 'decks',
  Goal: 'goals',
  Purchase: 'purchases',
  HistoryLog: 'history_logs',
};

const getTable = (entityName) => {
  const table = entityMap[entityName];

  if (!table) {
    throw new Error(`Entidade desconhecida: ${entityName}`);
  }

  return table;
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('Você precisa estar autenticado.');

  return data.user.id;
};

export const entities = Object.fromEntries(
  Object.keys(entityMap).map((entityName) => [
    entityName,
    {
      async list(order = '-created_date', limit = 100) {
        const table = getTable(entityName);
        const descending = String(order).startsWith('-');
        const column = String(order).replace(/^-/, '') || 'created_date';

        let query = supabase
          .from(table)
          .select('*')
          .order(column, { ascending: !descending });

        if (Number.isFinite(limit)) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
      },

      async create(payload) {
        const table = getTable(entityName);
        const user_id = await getCurrentUserId();

        const { data, error } = await supabase
          .from(table)
          .insert({ ...payload, user_id })
          .select()
          .single();

        if (error) throw error;

        return data;
      },

      async update(id, payload) {
        const table = getTable(entityName);

        const { data, error } = await supabase
          .from(table)
          .update({
            ...payload,
            updated_date: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return data;
      },

      async delete(id) {
        const table = getTable(entityName);

        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) throw error;

        return true;
      },
    },
  ])
);
