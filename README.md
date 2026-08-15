# Milenion Collection

Versão migrada do projeto para funcionar fora do Base44.

## Stack
- React + Vite
- Supabase Auth + Postgres
- Vercel (hospedagem sugerida)
- YGOPRODeck (dados externos das cartas)

## Variáveis de ambiente
Crie um `.env.local` com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

A chave usada no frontend deve ser a chave pública/publishable. Nunca coloque uma `service_role`/secret key no frontend.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

O código de compatibilidade em `src/api/base44Client.js` mantém as chamadas `base44.entities.*` existentes, mas agora elas usam o Supabase por baixo. Isso reduz a quantidade de componentes que precisaram ser alterados na migração.
