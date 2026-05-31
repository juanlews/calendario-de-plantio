# 🌱 Calendário de Plantio

App React Native (Expo) para gerenciar o cultivo de cannabis — da semente à cura.

> **Status:** Alfa (v0.2.0) — funcionalidades em desenvolvimento.

📦 **[Baixar APK na página de Releases](https://github.com/juanlews/calendario-de-plantio/releases)**

---

## Funcionalidades

### 🌿 Gestão de Plantios
- **Lista de plantios** ordenada por data com indicador visual do estágio
- **6 estágios de cultivo**: Germinação → Muda → Vegetativo → Floração → Secagem → Cura
- **Cálculo automático de datas** para cada estágio baseado no tempo desde a germinação
- **Apelido personalizado** (nickname) por plantio
- **Busca de strains** — catálogo com milhares de cepas (breeder, THC, CBD, tempo de floração, efeitos, sabores)
- **Classificação dupla**: Genética (Indica/Sativa/Híbrida) + Floração (Autoflorente/Fotoperiódica)

### 📋 Detalhes e Diário (Journal)
- **Visão completa do plantio** — strain, datas, estágio atual, previsões
- **7 tipos de registro**: 💧 Rega, 🧪 Nutrição, ✂️ Poda, 📷 Foto, 🎥 Vídeo, 💬 Comentário, 🔄 Mudança de estágio
- **Notas livres** por registro
- **Histórico completo** vinculado ao plantio com timeline visual

### 📅 Calendário
- **Visão mensal** com marcações coloridas por estágio e plantio
- **Eventos agrupados por planta** nos detalhes do dia
- **Próximos 45 dias** — lista de eventos futuros com projeções automáticas (floração e colheita estimadas)
- **Legendas temáticas** que acompanham o tema ativo

### 🆕 Novidades na v0.2.0
- **Mudança de estágio no diário** — altere o estágio via modal com date picker; gera registro `stage_change`
- **Date picker** — data exata da transição (datas passadas, mínimo = data da semente)
- **Projeções dinâmicas** — floração/colheita estimadas no "Próximos 45 dias" baseado nos `floweringDays`
- **Refatoração completa** — cada tela é um módulo componentizado com barrel exports
- **Correção de fuso** — datas com timezone local, sem drift UTC
- **Highlight visual** — data selecionada e hoje com círculo preenchido
- **Idade da planta** — `(Xd)` nos cards de evento do calendário

### 📅 Gestão de Estágios
- **Modal de edição** com seletor visual + date picker
- **Botão Salvar** — confirma e registra no diário automaticamente
- **Persistência automática** — `vegetativeDate`, `floweringDate`, `harvestDate` definidos conforme o estágio alvo

### ⚙️ Configurações
- **Modo de tema**: Claro / Escuro / Dinâmico (Material You)
- **Preview visual da cor** ativa no seletor de tema
- **Formato de data**: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- **Formato de hora**: HH:mm / HH:mm:ss
- **Fuso horário** automático (Intl API)

### 🎨 Temas
- **Material You (Android 12+)** — cores dinâmicas do wallpaper via `react-native-dynamic-theme`
- **Detecção automática** ao voltar para o app (AppState listener)
- **Fallback automático** com seed verde (#4CAF50) quando indisponível
- **Todas as telas** respeitam o tema ativo automaticamente

---

## Estrutura

```
src/
├── components/           # Componentes reutilizáveis
│   ├── TopHeader.tsx
│   └── ColorBall.tsx
├── context/              # React Context (estado global)
├── data/                 # Camada de dados (strains, storage, settings)
├── screens/              # Telas do app (componentizadas)
│   ├── AddJournalEntry/  #   Adicionar registro ao diário
│   ├── AddPlanting/      #   Adicionar novo plantio
│   ├── Calendar/         #   Calendário de eventos
│   ├── PlantDetail/      #   Detalhes de um plantio
│   ├── Plantings/        #   Lista de plantios
│   └── Settings/         #   Configurações do app
├── theme/                # Engine de temas (ThemeProvider, tokens)
├── types/                # Definições de tipos TypeScript
└── utils/                # Utilitários (datas, estágios, display names)
assets/
├── cannabis-strains.csv   # Base de dados original
└── strains_db.json        # Base compactada
```

Cada tela segue o padrão: `Screen.tsx` (lógica principal) + sub-componentes + `shared.tsx`/`styles.ts` + `index.ts` (barrel exports).

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Expo (New Architecture) |
| UI | React Native Paper (Material Design 3) |
| Navegação | React Navigation v7 (Bottom Tabs) |
| Temas | react-native-dynamic-theme |
| Persistência | @react-native-async-storage/async-storage |
| Calendário | react-native-calendars |
| Formulários | @react-native-community/datetimepicker |
| Linguagem | TypeScript |

---

## Instalação

### Via APK (Android)
1. Baixe o APK mais recente na [página de Releases](https://github.com/juanlews/calendario-de-plantio/releases)
2. Instale no Android (permita "Fontes desconhecidas" nas configurações)

### Via source (desenvolvimento)
```bash
git clone https://github.com/juanlews/calendario-de-plantio.git
cd calendario-de-plantio
npm install
npx expo start
```

### Build nativo
```bash
npx expo run:android          # debug, instala via USB
npx expo run:android --variant release  # gera APK release
```

> **Nota:** Material You só funciona em build nativo (APK). No Expo Go/Web, o fallback verde é usado.

---

## Requisitos

- **Android 8+** para rodar o app
- **Android 12+** para cores dinâmicas Material You
- Build nativo necessário (Expo Go não suporta native modules de temas dinâmicos)

---

## Créditos e Base de Dados

A base de dados de strains foi extraída e adaptada a partir do dataset:

- **[cannabis-strains](https://huggingface.co/datasets/JonusNattapong/cannabis-strains)** por **[JonusNattapong](https://huggingface.co/JonusNattapong)** no Hugging Face — mais de 8.000 strains com dados de breeder, THC, CBD, tempo de floração, efeitos, sabores, rendimento e muito mais.

Os dados originais (~35 colunas) foram processados e compactados para JSON otimizado, expandidos para **38 colunas** por cepa.

**Agradecimento** a **JonusNattapong** por compilar e disponibilizar publicamente essa base de dados.

---

## Licença

Uso pessoal e educacional.
