# flick.

Dois usuários. Um histórico. Mil filmes para assistir.

App privado de cinema para casal — Otavio e Larissa — com conta compartilhada,
diário de filmes, avaliação individual + nota do casal, watchlist com
"combinação" automática, sorteio de filme e uma seção de memórias ("Nossos
filmes").

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres) como banco compartilhado entre os dois celulares
- Deploy: Vercel

## Rodando localmente

```bash
npm install
npm run dev
```

As credenciais do Supabase já estão em `.env.local` (não vai pro Git). Se
precisar recriá-las, veja `.env.example`.

## Deploy no Vercel

1. Suba este projeto para um repositório no GitHub (veja abaixo).
2. Em https://vercel.com, clique em **Add New → Project** e importe o
   repositório.
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://fogbivjlmwpptcehhgfb.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (valor em `.env.example`)
   - `NEXT_PUBLIC_TMDB_API_KEY` = (opcional — veja abaixo)
4. Clique em **Deploy**. Pronto — o app fica acessível pra vocês dois pelo
   link do Vercel, e como os dois apontam pro mesmo Supabase, os dados
   ficam sincronizados entre os celulares.

### Subindo para o GitHub

```bash
git init
git add .
git commit -m "flick: primeira versão"
gh repo create flick --private --source=. --push
# ou, sem a CLI do GitHub:
# crie um repositório vazio no github.com e rode:
# git remote add origin <url-do-repo>
# git push -u origin main
```

## Busca de filmes (TMDB)

Com uma chave grátis do TMDB (https://www.themoviedb.org/settings/api), a
aba Explorar passa a ter busca com autocomplete: título, ano, pôster,
gêneros e sinopse são preenchidos automaticamente ao escolher um filme.
Sem a chave, o cadastro continua funcionando normalmente, só que manual.

## Estrutura

- `app/` — as 5 abas do app (Início, Explorar, Registrar, Nós, Perfil)
- `lib/queries.ts` — todo o acesso ao Supabase
- `lib/stats.ts` — cálculo das estatísticas do casal
- `lib/types.ts` — tipos e usuários (Otavio/Larissa)

## O que dá pra evoluir depois

- Login real (hoje cada um só escolhe "Sou Otavio" / "Sou Larissa" uma vez
  no celular — não há senha, então não use em um celular que vocês não
  controlam).
- Upload de foto da sessão (hoje é um campo de link de imagem).
- Estatística de "quem abandona mais filmes" (não há hoje um jeito de
  marcar um filme como abandonado).
