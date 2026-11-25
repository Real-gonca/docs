# Línguas de Angola — Protótipo

Protótipo estático da plataforma **Línguas de Angola**, dedicado à tradução de línguas nacionais angolanas para Português e Inglês.

## Como executar

A partir da pasta `app/`:

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

Depois abra `http://localhost:8765/index.html`.

## Estrutura

- `index.html` — Página inicial
- `traducao.html` — Ferramenta de tradução, voz, histórico, avaliação e sugestões
- `dicionario.html` — Dicionário demonstrativo com filtros
- `frases.html` — Frases úteis por contexto
- `login.html` — Registo/login demonstrativo (localStorage)
- `painel.html` — Painel administrativo/linguista demonstrativo
- `termos.html` / `privacidade.html` — Páginas legais
- `css/styles.css` — Estilos, tema claro/escuro, alto contraste, responsividade
- `js/data.js` — Dados demonstrativos
- `js/app.js` — Lógica da interface

## Regra de tradução (v1)

A tradução funciona apenas no sentido:

- Língua nacional angolana → Português
- Língua nacional angolana → Inglês

Não são permitidas traduções inversas, PT↔EN, ou entre línguas nacionais nesta versão.

## Nota importante

Este é um protótipo com **dados demonstrativos**. As traduções não devem ser consideradas validadas por falantes nativos ou linguistas especializados. Em produção, o conteúdo deve passar por validação linguística, backend seguro, base de dados, autenticação real e proteção de dados.
