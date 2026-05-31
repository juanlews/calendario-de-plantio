# 🌱 Calendário de Plantio — v0.2.0-alpha

## Novidades

### 🔄 Mudança de estágio no diário
- Modal de edição com seletor visual de estágios
- **Date picker** para escolher a data exata da transição (inclui datas passadas, mínimo = data da semente)
- Botão **Salvar** que confirma a mudança e registra automaticamente como `stage_change` no journal
- `vegetativeDate`, `floweringDate` e `harvestDate` definidos conforme o estágio alvo

### 📅 Projeções dinâmicas no calendário
- Floração e colheita estimadas aparecem automaticamente no "Próximos 45 dias"
- Baseadas nos `floweringDays` da strain e no tipo de floração (autoflorente vs fotoperiódica)
- Eventos estimados marcados com sufixo `(est.)`

### 🎨 Refatoração completa
- Cada tela agora é um **módulo componentizado** com barrel exports (`index.ts`)
- 6 pastas: `AddJournalEntry/`, `AddPlanting/`, `Calendar/`, `PlantDetail/`, `Plantings/`, `Settings/`
- 38 arquivos organizados (era 6 monolíticos)
- Tipagem e temas propagados corretamente entre componentes

### 🐛 Correções
- **Correção de fuso UTC** — datas no calendário usam timezone local, sem drift
- **Highlight visual** — data selecionada e hoje destacados com círculo preenchido
- **Idade da planta** — exibida como `(Xd)` nos cards de evento do calendário
- **Texto visível no tema escuro** — `EventsList` agora respeita `onSurface` / `onSurfaceVariant`

## Changelog completo
- `feat/media-journal`: registros de foto e vídeo com expo-image-picker
- `feat/calendar-ui-refactor`: refatoração das 6 telas + correções de fuso
- `feat/stage-change-journal`: date picker + journal entry + projeções dinâmicas

## ⚠️ Alpha
App em desenvolvimento ativo. Dados salvos localmente (AsyncStorage). Backup não implementado ainda.

## Build local
```bash
npm run build:apk
```
