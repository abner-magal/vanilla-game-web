# BN Games Test Suite

Estrutura modular de testes para o projeto BN Games.

## 📁 Estrutura de Diretórios

```
tests/
├── config.js              # Configurações globais (viewports, games, etc.)
├── run.js                 # Entry point principal
├── README.md              # Esta documentação
│
├── utils/                 # Utilitários compartilhados
│   ├── index.js           # Export central
│   ├── test-harness.js    # Classe TestHarness (assertions, reporting)
│   ├── file-helpers.js    # Funções de sistema de arquivos
│   ├── css-patterns.js    # Padrões regex para CSS
│   └── html-patterns.js   # Padrões regex para HTML
│
├── property/              # Testes de propriedade (property-based)
│   ├── game-board-fits-viewport.test.js
│   ├── overlay-content-visibility.test.js
│   ├── unique-entries.test.js
│   ├── navbar-consistency.test.js
│   ├── no-orphan-folders.test.js
│   ├── games-json-paths.test.js
│   ├── balloon-pop.test.js
│   ├── category-filter.test.js
│   ├── debounce.test.js
│   ├── drag-drop-pieces.test.js
│   ├── snake.test.js
│   ├── space-invaders-overflow.test.js
│   ├── whack-a-mole-truncation.test.js
│   └── property-main.test.js
│
├── validation/            # Testes de validação específicos
│   ├── space-invaders-overflow.test.js
│   ├── games-count.test.js
│   ├── text-truncation.test.js
│   ├── css-static.test.js
│   ├── canvas-aspect-ratio.test.js
│   ├── title-visibility.test.js
│   ├── responsive-overflow.test.js
│   ├── mobile-spacing.test.js
│   ├── whack-a-mole-size.test.js
│   ├── games-portuguese-descriptions.test.js
│   └── WhackAMoleGame.test.js
│
├── integration/           # Testes de integração
│   ├── navigation.test.js
│   ├── hamburger-menu.test.js
│   ├── mobile-back-button.test.js
│   ├── memory-match-interface.test.js
│   ├── breakout-overlay.test.js
│   ├── tetris-overlay.test.js
│   ├── orphan-folders.test.js
│   ├── simple-navigation.test.js
│   └── simple-responsive.test.js
│
└── runners/               # Scripts de execução
    ├── index.js           # Runner principal modular
    ├── run-all-tests.js   # Runner legado
    ├── run-tests.js       # Runner legado
    └── test-runner.html   # Runner HTML para browser
```

## 🚀 Como Executar

### Executar todos os testes modularizados
```bash
node game-site/tests/run.js
```

### Executar categoria específica
```bash
node game-site/tests/run.js property
node game-site/tests/run.js validation
node game-site/tests/run.js integration
```

### Executar teste individual
```bash
node game-site/tests/property/unique-entries.test.js
node game-site/tests/validation/space-invaders-overflow.test.js
```

## 🧪 Tipos de Testes

### Property Tests (Testes de Propriedade)
Validam propriedades invariantes que devem ser verdadeiras para qualquer entrada.

Exemplo: "Para qualquer viewport entre 320px e 768px, o game board deve caber na tela."

### Validation Tests (Testes de Validação)
Validam requisitos específicos em viewports ou condições específicas.

Exemplo: "No viewport de 375px (iPhone), não deve haver overflow horizontal."

### Integration Tests (Testes de Integração)
Validam a integração entre componentes e consistência entre jogos.

Exemplo: "Todos os jogos devem ter navbar com link 'Voltar ao Hub'."

## 📦 Usando os Utilitários

### TestHarness
```javascript
const TestHarness = require('./utils/test-harness');

const harness = new TestHarness('Meu Teste');

harness.assert(condition, 'Descrição do teste');
harness.assertEqual(actual, expected, 'Valores devem ser iguais');
harness.assertArrayEqual(arr1, arr2, 'Arrays devem ser iguais');

harness.printReport({
  feature: 'nome-da-feature',
  requirements: 'Requirements X.Y'
});
```

### File Helpers
```javascript
const { 
  getGamePaths, 
  readFileSafe, 
  fileExists,
  getAllGameDirs,
  getGamesJson 
} = require('./utils/file-helpers');

const paths = getGamePaths('snake');
// { css: '...style.css', html: '...index.html', js: '...SnakeGame.js' }

const content = readFileSafe(paths.css);
const games = getGamesJson();
```

### CSS Patterns
```javascript
const { 
  CSS_PATTERNS,
  hasMediaQuery,
  checkGameBoardStyles,
  hasReadableClampValues 
} = require('./utils/css-patterns');

const hasQuery = hasMediaQuery(css, 768);
const styles = checkGameBoardStyles(css);
// { hasWidth100, hasMaxWidthCalc, hasHeightAuto, hasAspectRatio, hasMinHeight }
```

### HTML Patterns
```javascript
const { 
  HTML_PATTERNS,
  checkNavigationElements,
  checkOverlayElements,
  checkCssImports 
} = require('./utils/html-patterns');

const nav = checkNavigationElements(html);
// { hasNavbar, hasBackToHub, hasLogo }
```

## 📋 Convenções

### Nomenclatura de Arquivos
- Testes modularizados: `[feature].test.js`
- Testes legados: `[feature]-legacy.test.js`

### Estrutura de Teste Modular
```javascript
#!/usr/bin/env node

const TestHarness = require('../utils/test-harness');
const { ... } = require('../utils/file-helpers');

const harness = new TestHarness('Nome do Teste');

function run() {
  // Setup
  console.log('🚀 Starting tests...');
  
  // Tests
  harness.log('Test 1: Descrição');
  harness.assert(condition, 'Mensagem');
  
  // Report
  harness.printReport({ feature: '...', requirements: '...' });
  return harness.getSummary();
}

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = run;
```

## 🔧 Configuração

Edite `config.js` para ajustar:
- Breakpoints de viewport
- Lista de jogos
- Tamanhos mínimos de fonte
- Categorias de teste

## 📊 Relatórios

Cada teste gera um relatório com:
- ✅ Testes passados
- ❌ Testes falhados
- 📈 Total de testes
- Feature e requirements validados

## 🗂️ Arquivos Legacy

Arquivos com sufixo `-legacy` são versões originais mantidas para compatibilidade.
Os arquivos sem sufixo são as versões modularizadas que usam os utilitários compartilhados.
