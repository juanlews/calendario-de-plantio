# 🌱 Calendário de Plantio

App React Native (Expo) para gerenciar o cultivo de cannabis — desde a semente até a cura.

## Funcionalidades

- **Busca de strains** — mais de 8.000 strains com dados de breeder, THC, tempo de floração, efeitos e sabores
- **Classificação dupla** — Genética (Indica / Sativa / Híbrida) separada de Floração (Autoflorente / Fotoperiódica)
- **Acompanhamento de estágios** — Germinação → Muda → Vegetativo → Floração → Secagem → Cura
- **Calendário visual** — datas marcadas para semeadura, floração e colheita esperadas
- **Previsão de colheita** — cálculo automático baseado no tipo de floração e tempo da strain
- **Persistência local** — dados salvos em AsyncStorage

## Estrutura

```
src/
├── context/          # React Context (estado global)
├── data/             # Camada de dados (strains, storage)
├── screens/          # Telas do app
│   ├── AddPlantingScreen.tsx
│   ├── CalendarScreen.tsx
│   └── PlantingsScreen.tsx
├── types/            # Definições de tipos TypeScript
└── utils/            # Utilitários (datas, estágios)
assets/
├── cannabis-strains.csv   # Base de dados original
└── strains_db.json        # Base compactada
```

## Tecnologias

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [react-native-calendars](https://github.com/wix/react-native-calendars)
- [date-fns](https://date-fns.org/)

## Instalação

```bash
npm install
npx expo start
```

## Créditos e Base de Dados

A base de dados de strains foi compilada a partir de dados públicos disponíveis em:

- **[Seed City](https://www.seed-city.com/)** — catálogo de sementes de cannabis com dados de breeder, THC, tempo de floração, efeitos, sabores e rendimento.

Os dados originais (CSV com ~35 colunas) foram processados e compactados para um formato JSON otimizado, contendo apenas os campos relevantes para o app.

**Agradecimento** aos contribuidores e curadores da base de dados do Seed City por manterem essas informações acessíveis.

## Licença

Uso pessoal e educacional.
