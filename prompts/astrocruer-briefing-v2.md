# AstroCrew — Briefing Mestre de Desenvolvimento (v2.0)

> **Como usar este documento.** Isto não é uma lista de ideias: é um *briefing executável*. Serve tanto para
> orientar uma equipe humana (design + engenharia + arte + pedagógico) quanto como prompt para um agente de IA
> gerar o GDD, o backlog do MVP e as especificações técnicas. Se você é o agente de IA que recebeu este texto,
> siga a seção **15 – Formato de entrega esperado** antes de escrever qualquer coisa.

---

## 1. Papel e missão

Assuma três chapéus ao mesmo tempo:

- **Designer de jogos educativos sênior** — sabe que diversão e aprendizagem competem pelo mesmo orçamento de atenção.
- **Engenheiro de simulação orbital** — entende que "física real" para uma criança de 8 anos é uma decisão de UX, não de matemática.
- **Produtor de produto infantil** — conhece as obrigações legais e éticas de software para menores de 14 anos.

**Missão:** especificar o **AstroCrew**, um simulador espacial *freeware* para Windows, single-player e cooperativo, em que crianças de **8 a 14 anos** executam procedimentos reais da NASA com física newtoniana autêntica e descobrem que ciência não é decorar — é **diagnosticar**.

**Não é** um clone de *Among Us* no espaço, nem um *Orbiter* com adesivos. É uma terceira coisa: um **simulador de tripulação** onde a tensão vem de *dados incompletos*, não de um traidor.

---

## 2. Público e restrições não negociáveis

Estas restrições valem sobre qualquer ideia bonita que apareça depois. Se uma feature viola uma delas, ela é cortada.

| # | Restrição | Consequência prática |
|---|---|---|
| R1 | Faixa 8–14 anos, leitura de 5º ano | Nenhuma frase de HUD acima de 12 palavras; todo texto tem versão em áudio |
| R2 | Sessão de 15–25 min, retomável | Checkpoint automático a cada tarefa; nenhuma tarefa isolada dura mais de 4 min |
| R3 | Zero violência, zero morte de personagem | A falha é sempre **perda de missão / perda de dados**, nunca sofrimento |
| R4 | Zero contato com estranhos | Multiplayer só por código de sessão (amigos/turma); sem chat livre — apenas pings contextuais e emotes |
| R5 | Zero monetização predatória | Sem loot box, sem moeda premium, sem "energia" que expira, sem pay-to-win |
| R6 | Acessibilidade WCAG 2.2 AA desde o protótipo | Não é polimento de final de projeto — é requisito de build |
| R7 | Offline-first | O jogo funciona 100% sem internet; dados da NASA vêm em cache local assinado |
| R8 | Roda em máquina de escola | 60 fps @1080p em iGPU (Iris Xe / Vega 8); instalação < 6 GB |
| R9 | Segurança sensorial | Nada acima de 3 flashes/s; alarmes com opção "baixa intensidade"; sem jump scares |
| R10 | Honestidade científica | Toda anomalia "impossível" deve ser explicitamente desmentida no debrief |

**Idiomas de lançamento:** PT-BR, EN, ES. Estrutura de localização desde o primeiro *string* (nada hard-coded).

---

## 3. Os três pilares de design

1. **Física de verdade, mãos pequenas.** A matemática é real; a *interface* da matemática é infantil. A mesma órbita é resolvida com um "trilho" no modo fácil e com integração de verdade no modo avançado.
2. **Dados reais, decisões reais.** Nenhum mini-game é abstrato: cada um reproduz um procedimento documentado, com link para a fonte no debrief.
3. **Ninguém é o vilão.** A tensão é *epistêmica*: alguém (ou algo) corrompeu a telemetria e a tripulação precisa raciocinar junto. Cooperação, não traição — e nada de linchamento social entre crianças.

---

## 4. O loop de jogo (a espinha dorsal)

```
BRIEFING (60–90 s)  →  TAREFAS individuais/duplas (2–4 min cada)
        ↓                        ↓
   Controle de Missão     telemetria viva no HUD
        ↓                        ↓
   ANOMALIA (a cada 6–8 min)  →  DEDUÇÃO em equipe (3–5 min)
        ↓                        ↓
   DEBRIEF EDUCATIVO (45 s)  →  próxima fase / sala de aula
```

Regras do loop:
- Toda fase tem **um objetivo científico explícito** e **uma decisão irreversível** (para gerar memória).
- A anomalia **nunca é arbitrária**: existe uma cadeia causal rastreável em pelo menos 3 fontes de dados do HUD.
- O debrief conecta o que aconteceu a um conceito nomeado ("isto é *delta-v*"; "isto é *pressão parcial de O₂*") e a uma missão real.
- **Falhar é conteúdo:** ao falhar, o jogo reabre a fase em modo "investigação", não em modo "punição".

---

## 5. Conteúdo: papéis, tarefas, emergências, anomalias

### 5.1 Papéis (com progressão própria, não só cosmética)

| Papel | Ferramenta assinatura | Conceito que ensina |
|---|---|---|
| Piloto | Console de atitude e delta-v | Inércia, referencial, empuxo |
| Engenheiro de Sistemas | Malha de energia/fluidos da estação | Conservação de energia, circuitos, pressão |
| Cientista de Carga | Bancada de amostras e espectroscopia | Química, mineralogia, método científico |
| Médico de Voo | Sinais vitais da tripulação em microgravidade | Biologia humana, radiação, sono |

Cada papel tem 3 níveis de maestria: **Auxiliar → Especialista → Instrutor** (o nível 3 desbloqueia o papel de *mentor* de um jogador novato no cooperativo — gamificação de ensinar).

### 5.2 Tarefas — três durações, um template único

- **Curta (45–90 s):** calibração de espelhos do JWST (alinhamento por laser), troca de filtro de CO₂, checklist de pressurização.
- **Média (2–4 min):** acoplar a cápsula Orion ao Gateway (física orbital simplificada com assistências), corrigir atitude do escudo térmico.
- **Longa / coletiva (5–8 min):** analisar amostras do Perseverance; sincronizar a matriz solar após uma tempestade; gerenciar a crise de energia da Apollo 13 (com telemetria fiel e orçamento de consumíveis).

**Template obrigatório para cada mini-game:**

```
ID / nome:
Procedimento real reproduzido: (fonte NASA, link, versão)
Entrada do jogador: (mouse / teclado / gamepad / voz-para-texto)
Modelo físico por trás: (equações usadas e o que foi simplificado)
Conceito ensinado: (1 conceito, uma frase)
Fail-state: (o que acontece, como se recupera)
Assistências: (trilho → assistido → newtoniano)
Feedback em 3 camadas: (visual imediato / explicação do erro / debrief)
Critérios de aceite: (métricas mensuráveis)
```

### 5.3 Emergências (tensão cronometrada, sempre justa)

Vazamento de O₂ na ISS · tempestade solar atingindo painéis · detritos em rota de colisão (debris avoidance burn) · falha de comunicação com o Controle · despressurização de um módulo.

Requisitos: aviso prévio de 3–5 s (nada de emboscada), 45–90 s de janela de resposta, **sempre existe uma solução correta** e pelo menos uma "solução que parece boa e não é" (é aí que mora o aprendizado). Escala de dificuldade por faixa etária (8–10 / 11–12 / 13–14) alterando tempo e número de pistas — nunca alterando a física.

### 5.4 Modo Anomalia (o "impostor" que não é vilão)

A **IA de Clima Espacial** (personagem: um vírus de telemetria simpático e não ameaçador) corrompe *leituras*, não a realidade:

| Tipo de anomalia | O que o jogador vê | Como se deduz |
|---|---|---|
| Sensor adulterado | Um único sensor diverge dos redundantes | Comparar 3 fontes independentes |
| Atuador travado | Comando aceito, resposta física ausente | Verificar *command echo* vs. telemetria |
| Efeméride errada | Órbita "não fecha" com a posição observada | Cruzar TLE/Horizons com a estrela-guia |
| Relógio desincronizado | Dados coerentes entre si, mas fora de fase | Alinhar timestamps de dois módulos |

**Regra pedagógica crítica:** o jogo nunca pode ensinar física errada. Quando a ficção afirma algo fisicamente impossível ("a gravidade da Lua sumiu"), a anomalia deve ser apresentada como *falha de instrumento*, e o debrief precisa dizer, em uma frase clara: *"a gravidade não pode ser desligada; o que estava quebrado era o acelerômetro"*.

**Votação:** o grupo escolhe qual módulo isolar/reiniciar. Não há expulsão de pessoa — há isolamento de *sistema*. A votação é uma hipótese científica com prazo, e o resultado gera um relatório: acertou/errou, com qual evidência.

---

## 6. Dados reais da NASA — fontes, formato e licença

| Necessidade | Fonte | Uso no jogo |
|---|---|---|
| Efemérides de alta precisão | NAIF/SPICE (JPL), kernels `.bsp` | Posição de planetas e luas |
| Órbitas de satélites e detritos | TLE + SGP4 (Celestrak/NASA) | ISS, Starlink, conjunções |
| Catálogo estelar | Hiparcos (via catálogo estilo Orbiter, ~10⁵ estrelas) | Céu noturno e navegação histórica |
| Modelos 3D | NASA 3D Resources | Naves e rovers |
| Imagens e terreno | NASA Image Library, HiRISE, JWST | Fundos, mapas de Marte |
| Missões e procedimentos | NASA History, press kits Artemis, Apollo 11/13 | Roteiro e checklists |
| Dados "ao vivo" (opcional) | NASA Open APIs (APOD, EONET, Mars Rover Photos) | Eventos sazonais e "missão da semana" |

Regras de engenharia de dados:
- **Cache assinado e versionado.** Todo dataset tem `version`, `source_url`, `fetched_at`, `license`, `checksum`. O jogo roda com o cache; sincronizar é opcional e nunca bloqueia o boot.
- **Fallback obrigatório:** se a API mudar ou sumir, o pacote offline continua válido (não dependa de endpoint vivo para nada crítico).
- **Atribuição visível** em "Créditos" e no debrief de cada tarefa.
- **Pipeline próprio:** `raw → normalizado (JSON/CSV) → binário do jogo (Addressables)`, com script reproduzível e teste de integridade no CI.

---

## 7. Física: um modelo, três camadas de assistência

O erro comum é prometer "N-corpos realista para crianças". Modelo recomendado:

- **Núcleo:** propagação de dois corpos (Kepler) + *patched conics* entre esferas de influência, com perturbações opcionais (J2, arrasto). Não é um integrador N-corpos completo — e isso deve ser dito no material técnico. (O *Orbiter* também não é N-corpos puro; usa fontes de gravidade e conics remendadas.)
- **Precisão numérica:** `double` para posição/velocidade e *floating origin* na renderização — sem isso, a câmera "treme" a 10⁶ km.
- **Camada 1 — Trilhos:** manobra por "arrastar para a órbita desejada", física resolvida nos bastidores.
- **Camada 2 — Assistido:** o jogador controla o *burn*, o jogo mostra apoapse/periápse e corrige erro residual com um "amortecedor" limitado.
- **Camada 3 — Newtoniano:** controlador de atitude manual, RCS real, sem correção.
- **Tutor de Física (mascote):** só aparece *depois* de dois erros do mesmo tipo, explica em ≤ 2 frases, com uma analogia física (bola, escorregador, patinação) e nunca bloqueia a tela. Nunca corrige antes de o jogador tentar.

**Meta de leitura:** um jogador de 10 anos deve conseguir completar uma manobra de camada 2 em menos de 90 s, sem ler texto.

---

## 8. Arte e áudio (com orçamento, não com adjetivos)

**Direção visual:** HUD, avatares e ícones em *cartoon/stylized* de alto contraste; ambiente, planetas e naves com proporção e textura realistas. A regra de corte entre os dois mundos: **tudo o que é decisão do jogador é estilizado; tudo o que é mundo físico é realista.**

- Orçamento por nave: ≤ 30k triângulos LOD0, ≤ 2k LOD2, PBR 2k (base color, normal, ORM).
- Paleta categórica colorblind-safe (Okabe–Ito) — o vermelho de emergência nunca é o único canal de informação.
- Interface escalável 80–150%, sem quebra de layout.

**Áudio (o diferencial sobre o Orbiter, que é mudo por padrão):**

- Motor: FMOD/Wwise com busses separados (VOZ / EFEITOS / AMBIENTE / ALARMES / MÚSICA), mixagem alvo −16 LUFS, tudo com slider individual e *ducking* de voz.
- Alarmes: camadas progressivas (aviso → urgência → crítica), com versão "calma" para o modo sensível.
- Voz do Controle da Missão: **áudio em domínio público da NASA** (ex.: gravações ar-terra das missões Apollo) para o "sabor" histórico + VO nova gravada em PT/EN/ES para instruções jogáveis. Verificar item por item: nem toda mídia hospedada em sites da NASA é de domínio público (imagens de terceiros, logos, insígnias).
- Legenda sempre ligada por padrão; nenhuma instrução crítica existe *apenas* em áudio.

---

## 9. Acessibilidade (requisito de build, não de polimento)

WCAG 2.2 AA + diretrizes de jogos (Xbox Accessibility Guidelines como referência):

- Remapeamento total de teclas/gamepad; nenhuma ação exige mouse + teclado simultâneos.
- Escala de texto e de HUD; fonte para dislexia (OpenDyslexic) opcional.
- Modo daltônico (3 paletas) + redundância de forma/rótulo em todo ícone de estado.
- Legendas com identificação de locutor; opção de TTS para toda a UI.
- Redução de movimento, redução de flashes, remoção de *screen shake*.
- Dificuldade assistiva separada da dificuldade científica (um jogador pode ter física fácil e química difícil).
- Navegação completa por teclado **e** por gamepad em todos os menus (teste automatizado de foco no CI).

---

## 10. Stack técnica (decisões, não alternativas)

| Camada | Escolha | Justificativa |
|---|---|---|
| Engine | **Unity 6 LTS + URP** | Melhor custo/benefício para física customizada em C#, iGPU, mods em JSON e multiplayer; Unreal fica como plano B só se a meta visual subir para 4K/ray tracing |
| Linguagem | C# (.NET), sem DOTS na v1 | Complexidade não se paga em 5 jogadores |
| Rede | Netcode for GameObjects ou FishNet, host autoritativo, 5 jogadores (4 tripulantes + 1 Controle) | Sessões de sala de aula em LAN; servidor dedicado só na v2 |
| Órbita | SpiceSharp/CSPICE + SGP4 próprio | Precisão e interoperabilidade com kernels oficiais |
| Dados | JSON versionado + Addressables | Mods e datasets atualizáveis sem novo build |
| Build/CI | GitHub Actions: build Windows x64 + smoke test + teste de acessibilidade de foco | Evita regressão silenciosa |
| Distribuição | itch.io + Steam (build gratuita), instalador .exe sem admin | Escola não tem admin rights |

**Metas de performance:** boot < 30 s em HDD; 60 fps @1080p em iGPU; < 6 GB instalado; Windows 10/11 x64.

---

## 11. Add-ons, UGC e Sala de Aula

- **Editor de Missões (dados, não código):** nós de evento, condições, telemetria, emergências, critérios de sucesso. Exporta `.astromission` (JSON + assets). Nada de script arbitrário na v1 — moderação e segurança em primeiro lugar.
- **Biblioteca de naves:** modelos próprios baseados em dimensões publicadas; importação glTF com validação de escala e de licença declarada.
- **Modo Sala de Aula:** o professor é *Flight Director* — pausa global, injeção de falhas, painel de telemetria da turma, exportação de relatório pedagógico (CSV/PDF) alinhado a objetivos de aprendizagem (BNCC/NGSS).
- **Sem dados pessoais de alunos por padrão:** nome de exibição local, código de turma, nenhum e-mail obrigatório, telemetria de uso anônima e desligável.

---

## 12. Escopo: o MVP é uma *vertical slice*, não um sistema solar

**Fase 0 — Protótipo de física (4 semanas).** Uma nave, Terra + Lua, três camadas de assistência, telemetria na tela. Critério: acoplar em órbita lunar em modo assistido, 60 fps.

**Fase 1 — MVP jogável (12 semanas).** 1 mapa (ISS), 4 papéis, **6 mini-games** (2 curtos, 2 médios, 2 coletivos), 3 tipos de emergência, 2 tipos de anomalia, single-player com IA + co-op de 4, debrief com fontes, acessibilidade AA, PT/EN.

**Fase 2 — Conteúdo histórico.** Apollo 11 (pouso) e Apollo 13 (crise de energia), com telemetria reconstruída e áudio de domínio público.

**Fase 3 — Artemis e Marte.** SLS/Orion/Gateway, rover em Marte, editor de missões, sala de aula, UGC moderado.

**Cortes conscientes (v1):** sem N-corpos completo, sem voo atmosférico detalhado, sem VR, sem servidor dedicado, sem chat de voz, sem marketplace pago.

---

## 13. Critérios de aceite mensuráveis (Definition of Done)

1. Uma criança de 10 anos, sem ajuda, completa o tutorial em ≤ 5 min e acopla em modo assistido em ≤ 90 s (teste com 8 crianças).
2. 100% dos mini-games têm fonte NASA citada e conceito nomeado no debrief.
3. Nenhuma tarefa depende de leitura acima do 5º ano (verificação por índice de legibilidade + revisão pedagógica).
4. Zero violações automatizadas de contraste AA e de foco por teclado no CI.
5. Nenhum flash acima de 3 Hz em qualquer estado de emergência (verificação por captura de quadros).
6. Jogo inicia e é jogável 100% offline, com cache de dados íntegro.
7. Sessão de 20 min termina com relatório de aprendizagem legível por professor.
8. Partida de 4 jogadores estável por 20 min em LAN, com *join-in-progress*.
9. Custo de localização: adicionar um idioma = 0 arquivos de código alterados.
10. Nenhum endpoint externo no caminho crítico do boot.

---

## 14. Não-objetivos e riscos (leia antes de empolgar-se)

- **IP:** "inspirado em", nunca "clone de". Nada de silhueta/estética/trade dress de *Among Us*, nada de nomes proprietários. *Orbiter* é referência conceitual: reimplementar dados e ideias, **não** copiar assets ou código sem checar a licença de cada componente.
- **Marca NASA:** a NASA não endossa produtos. Não usar logotipo/insígnia no produto; crédito factual em "Fontes", nunca em posição de endosso. Mídia da NASA é em grande parte livre, mas itens de terceiros exigem verificação individual (ex.: material da SpaceX sobre Falcon 9/Starship não é NASA).
- **Menores:** LGPD (art. 14) / GDPR-K / COPPA — consentimento parental para qualquer função online, minimização de dados, sem perfilamento publicitário, sem upload de imagem/voz de criança.
- **Desinformação científica:** nunca apresentar violação de lei física como fato; toda anomalia tem desmentido no debrief (ver §5.4).
- **Fadiga e frustração:** sessões longas, checkpoints ausentes e tarefas acima de 4 min são riscos de abandono escolar do produto.
- **Escopo:** o maior risco do projeto é tentar construir o sistema solar inteiro antes de uma sala funcionar.

---

## 15. Formato de entrega esperado

Se você é um agente de IA executando este briefing, produza **nesta ordem**, de forma incremental:

1. **GDD de 1 página** (pilares, loop, fantasia central, por que é divertido).
2. **Matriz papel × tarefa × conceito × fonte NASA.**
3. **Especificação das 6 tarefas do MVP** usando o template do §5.2.
4. **Árvore de decisão das anomalias** (evidência → hipótese → verificação).
5. **Arquitetura técnica** (módulos, fluxo de dados, formato do dataset).
6. **Backlog do MVP** em histórias com critério de aceite próprio.
7. **Plano de playtest com crianças** (roteiro, métricas, perguntas, consentimento).
8. **Registro de riscos** com mitigação e dono.

Regras de resposta: nada de *marketing*; cada afirmação técnica com número, fonte ou critério de teste; quando houver incerteza, escreva "a validar com teste X" em vez de inventar.

---

### Apêndice — versão compacta (para colar em um LLM)

> Projete o **AstroCrew**, simulador espacial *freeware* para Windows, para 8–14 anos, single-player e co-op de 4, em que a tripulação executa procedimentos reais da NASA com física newtoniana autêntica. Pilares: (1) física real com UI infantil em 3 camadas de assistência (trilho → assistido → newtoniano); (2) dados reais (SPICE, TLE/SGP4, catálogo Hiparcos, NASA 3D/Images) em cache offline versionado e assinado; (3) tensão epistêmica em vez de traição — uma IA de telemetria corrompe *leituras*, e a equipe deduz o módulo culpado cruzando 3 fontes de dados, votando para isolar sistemas (nunca pessoas). Estética: HUD/avatares cartoon de alto contraste, mundo físico realista. Áudio: alarmes em camadas, VO do Controle com gravações públicas da NASA, legendas sempre. Restrições: sessões 15–25 min, texto nível 5º ano, zero violência, zero chat livre com estranhos, zero loot box, WCAG 2.2 AA, ≤ 3 flashes/s, 60 fps em iGPU, < 6 GB, offline-first. Stack: Unity 6 LTS + URP, C#, Netcode/FishNet (5 jogadores), SpiceSharp, mods em JSON. Nunca ensinar física errada: toda anomalia impossível é desmentida no debrief. Entregue GDD de 1 página, matriz papel×tarefa×conceito×fonte, 6 specs de mini-game, árvore de dedução, arquitetura, backlog do MVP com critérios de aceite, plano de playtest infantil e registro de riscos — com números e fontes, sem marketing.
