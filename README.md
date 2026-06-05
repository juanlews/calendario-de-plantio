# 🌱 Calendário de Plantio

App React Native (Expo) para gerenciar o cultivo de cannabis — da semente à cura.

> **Status:** Alfa (v0.8.0) — funcionalidades em desenvolvimento.

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

### 🔄 Atualizações Automáticas (v0.8.0)
- **Verificação automática no GitHub** — ao abrir o app (uma vez por dia) consulta a API de releases do GitHub
- **Verificação manual** — botão "Verificar atualizações" em Configurações → Sobre
- **Modal de atualização** — se houver nova versão, abre modal com link direto para download do APK
- **Versão dinâmica** — versão lida automaticamente do `app.json` (sem hardcode)
- **Cache inteligente** — evita verificações repetidas no mesmo dia via `expo-secure-store`

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
- **Seção "Sobre"** — versão dinâmica + botão de verificação de atualizações + status da última verificação

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
│   ├── ColorBall.tsx
│   └── UpdateChecker.tsx      # Auto-update check on app start
├── context/              # React Context (estado global)
│   ├── PlantContext.tsx
│   └── SettingsContext.tsx
├── data/                 # Camada de dados (strains, storage, settings)
│   ├── journalStorage.ts
│   ├── plants.ts
│   ├── settingsStorage.ts
│   ├── storage.ts
│   ├── strains_data.ts
│   └── strains.ts
├── hooks/                # Custom hooks
│   └── useUpdateCheck.ts      # Hook para verificação de updates na UI
├── i18n/                 # Internacionalização
│   ├── index.ts
│   └── resources.ts
├── screens/              # Telas do app (componentizadas)
│   ├── AddJournalEntry/  #   Adicionar registro ao diário
│   │   ├── AddJournalEntryScreen.tsx
│   │   ├── DateTimeSelector.tsx
│   │   ├── EntryTypeSelector.tsx
│   │   ├── MediaPicker.tsx
│   │   ├── NutritionForm.tsx
│   │   ├── PruningForm.tsx
│   │   ├── WateringForm.tsx
│   │   ├── shared.tsx
│   │   └── index.ts
│   ├── AddPlanting/      #   Adicionar novo plantio
│   │   ├── AddPlantingScreen.tsx
│   │   ├── StageSelector.tsx
│   │   ├── StrainDetailCard.tsx
│   │   ├── StrainSearchModal.tsx
│   │   ├── shared.tsx
│   │   └── index.ts
│   ├── Calendar/         #   Calendário de eventos
│   │   ├── CalendarScreen.tsx
│   │   ├── CalendarLegend.tsx
│   │   ├── EventsList.tsx
│   │   ├── constants.ts
│   │   ├── localeConfig.ts
│   │   ├── styles.ts
│   │   └── index.ts
│   ├── PlantDetail/      #   Detalhes de um plantio
│   │   ├── PlantDetailScreen.tsx
│   │   ├── PlantHeader.tsx
│   │   ├── InfoGrid.tsx
│   │   ├── JournalTimeline.tsx
│   │   ├── QuickActions.tsx
│   │   ├── StageEditModal.tsx
│   │   ├── shared.tsx
│   │   └── index.ts
│   ├── Plantings/        #   Lista de plantios
│   │   ├── PlantingsScreen.tsx
│   │   ├── PlantCard.tsx
│   │   ├── shared.tsx
│   │   └── index.ts
│   └── Settings/         #   Configurações do app
│       ├── SettingsScreen.tsx
│       ├── SettingRow.tsx
│       ├── constants.ts
│       ├── styles.ts
│       └── index.ts
├── services/             # Serviços externos
│   └── updateService.ts        # GitHub API + version comparison
├── theme/                # Engine de temas (ThemeProvider, tokens)
│   ├── ThemeProvider.tsx
│   └── colors.ts
├── types/                # Definições de tipos TypeScript
│   ├── planting.ts
│   └── settings.ts
└── utils/                # Utilitários (datas, estágios, display names)
    ├── dateUtils.ts
    └── mediaStorage.ts
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
| Internacionalização | react-i18next |
| Atualizações | expo-constants, expo-secure-store, GitHub Releases API |
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

## ☕ Apoie o projeto

Este é um projeto open source mantido no tempo livre. Se o app te ajuda, qualquer apoio faz diferença:

[![GitHub Sponsors](https://img.shields.io/github/sponsors/juanlews?style=for-the-badge&logo=github-sponsors&logoColor=white&color=EA4AAA)](https://github.com/sponsors/juanlews)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/lews)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/produtor.lews)

> Obrigado! 💚

---

## Créditos e Base de Dados

A base de dados de strains foi extraída e adaptada a partir do dataset:

- **[cannabis-strains](https://huggingface.co/datasets/JonusNattapong/cannabis-strains)** por **[JonusNattapong](https://huggingface.co/JonusNattapong)** no Hugging Face — mais de 8.000 strains com dados de breeder, THC, CBD, tempo de floração, efeitos, sabores, rendimento e muito mais.

Os dados originais (~35 colunas) foram processados e compactados para JSON otimizado, expandidos para **38 colunas** por cepa.

**Agradecimento** a **JonusNattapong** por compilar e disponibilizar publicamente essa base de dados.

---

## Licença

Uso pessoal e educacional.