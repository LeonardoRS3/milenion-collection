import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.invalid', supabaseKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
  if (!table) throw new Error(`Entidade desconhecida: ${entityName}`);
  return table;
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Você precisa estar autenticado.');
  return data.user.id;
};

const normalizeUser = (user) => user ? ({
  id: user.id,
  email: user.email,
  full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
  ...user.user_metadata,
}) : null;

const entities = Object.fromEntries(Object.keys(entityMap).map((entityName) => [entityName, {
  async list(order = '-created_date', limit = 100) {
    const table = getTable(entityName);
    const descending = String(order).startsWith('-');
    const column = String(order).replace(/^-/, '') || 'created_date';
    let query = supabase.from(table).select('*').order(column, { ascending: !descending });
    if (Number.isFinite(limit)) query = query.limit(limit);
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
      .update({ ...payload, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const table = getTable(entityName);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
}]));

export const base44 = {
  entities,
  auth: {
    async me() {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return normalizeUser(data.user);
    },

    async loginViaEmailPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return normalizeUser(data.user);
    },

    async register({ email, password, full_name }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: full_name || '' },
        },
      });
      if (error) throw error;
      return data;
    },

    async verifyOtp({ email, otpCode }) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup',
      });
      if (error) throw error;
      return {
        ...data,
        access_token: data.session?.access_token,
      };
    },

    async resendOtp(email) {
      const { data, error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return data;
    },

    setToken(token) {
      // Supabase manages its session internally. Kept only for compatibility.
      return token;
    },

    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login';
    },

    async resetPasswordRequest(email) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    },

    async resetPassword({ newPassword }) {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },

    async loginWithProvider(provider, returnPath = '/') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${returnPath}`,
        },
      });
      if (error) throw error;
      return data;
    },

    redirectToLogin() {
      window.location.href = '/login';
    },
  },
};
