# 🎮 BN Games - Vanilla JS Arcade Suite

Uma coleção de **10 jogos arcade clássicos** construídos inteiramente com tecnologias web nativas (HTML5, CSS3, JavaScript ES6+). Zero frameworks, zero bundlers, zero dependências.

---

## 🚀 Demo Rápida

```bash
# Clone o repositório
git clone https://github.com/abner-magal/vanilla-game-web.git
cd vanilla-game-web

# Inicie um servidor local
python -m http.server 8080

# Acesse no navegador
# http://localhost:8080/public/
```

---

## 🎯 Sobre o Projeto

**BN Games** demonstra o poder do JavaScript moderno e manipulação DOM sem dependência de frameworks pesados. O projeto oferece:

- ⚡ **Carregamento instantâneo** (< 2 segundos)
- 🎮 **10 jogos completos** com mecânicas distintas
- 💾 **High scores persistentes** via localStorage
- 🎚️ **Sistema de dificuldade** (Fácil, Médio, Difícil)
- 🔊 **Áudio sintetizado** via Web Audio API
- 📱 **Design responsivo** para desktop e mobile

---

## 🕹️ Jogos Disponíveis

| Jogo | Categoria | Descrição |
|------|-----------|-----------|
| 🐍 **Snake** | Classic | Snake clássico turbinado com velocidade crescente |
| 🧩 **Tetris** | Puzzle | Tetris lendário com quedas suaves e ritmo arcade |
| 👾 **Space Invaders** | Action | Defenda a Terra de ondas alien |
| 🏓 **Pong** | Sports | Pong clássico com raquetes responsivas |
| 🧱 **Breakout** | Arcade | Quebre paredes neon com ricochetes controlados |
| 🔨 **Whack-a-Mole** | Action | Arcade de reflexo puro |
| 🎈 **Balloon Pop** | Arcade | Estoure balões neon, desvie das bombas |
| 🃏 **Memory Match** | Puzzle | Duelo de memória com cartas neon |
| 💡 **Simon Says** | Memory | Memorize sequências de luz e som |
| 🔢 **Number Puzzle** | Puzzle | Organize números arrastando com estratégia |

---

## 📁 Estrutura do Projeto

```
vanilla-game-web/
├── public/                    # Assets públicos e landing page
│   ├── index.html             # Dashboard principal
│   ├── config/games.json      # Configuração dos jogos
│   ├── js/                    # Scripts da landing page
│   ├── css/                   # Estilos da landing page
│   └── assets/images/         # Thumbnails dos jogos
│
├── src/
│   ├── core/                  # Engine compartilhado
│   │   ├── GameEngine.js      # Classe base para todos os jogos
│   │   ├── GameLoop.js        # requestAnimationFrame wrapper
│   │   ├── InputManager.js    # Gerenciamento de teclado
│   │   ├── AudioManager.js    # Sistema de áudio
│   │   ├── DifficultyManager.js # Sistema de níveis
│   │   └── Storage.js         # Wrapper localStorage
│   │
│   ├── components/UI/         # Componentes reutilizáveis
│   │   ├── ScoreBoard.js
│   │   ├── Button.js
│   │   ├── Timer.js
│   │   └── VolumeControl.js
│   │
│   └── games/                 # Um diretório por jogo
│       ├── snake/
│       ├── tetris/
│       ├── pong/
│       └── ...
│
├── styles/                    # CSS global e temas
│   ├── variables.css          # CSS Custom Properties
│   ├── global.css             # Reset e estilos base
│   └── components/            # Estilos de componentes
│

```

---

## 🛠️ Stack Tecnológico

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura semântica |
| **CSS3** | Estilização, animações, Grid/Flexbox |
| **JavaScript ES6+** | Lógica de jogo, DOM manipulation |
| **Web Audio API** | Síntese de sons em tempo real |
| **LocalStorage** | Persistência de high scores |

### Sem Dependências de Runtime

- ❌ Sem React, Vue, Angular
- ❌ Sem Webpack, Vite, Parcel
- ❌ Sem npm packages
- ✅ Código roda direto do source

---

## 🚀 Como Executar

### Opção 1: Python (Recomendado)

```bash
cd vanilla-game-web
python -m http.server 8080
# Acesse: http://localhost:8080/public/
```

### Opção 2: Node.js

```bash
npx serve vanilla-game-web -p 8080
```

### Opção 3: PHP

```bash
cd vanilla-game-web
php -S localhost:8080
```

### Opção 4: VS Code Live Server

1. Instale a extensão "Live Server"
2. Clique direito em `public/index.html`
3. Selecione "Open with Live Server"

> ⚠️ **Nota**: O projeto funciona melhor com servidor local devido ao `fetch()` do `games.json`.

---

### Estrutura de Testes

- **Integration**: Navegação, menu hamburger, overlays
- **Property**: Lógica de jogos, dados, consistência
- **Validation**: CSS responsivo, overflow, aspect ratio

---

## 🎚️ Sistema de Dificuldade

Todos os jogos suportam 3 níveis de dificuldade:

| Nível | Velocidade | Spawn Rate | Tempo |
|-------|------------|------------|-------|
| Fácil | 0.7x | 0.6x | 1.5x |
| Médio | 1.0x | 1.0x | 1.0x |
| Difícil | 1.5x | 1.4x | 0.7x |

High scores são salvos separadamente por dificuldade.

---

## 🔊 Sistema de Áudio

O projeto usa **Web Audio API** para síntese de sons em tempo real:

- Zero arquivos de áudio para carregar
- Controle granular de volume
- Compatibilidade mobile (sem problemas de autoplay)
- UI de volume estilo equalizer com 10 barras

---

## 🎨 Design System

### Cores da Marca

| Token | Hex | Uso |
|-------|-----|-----|
| `brand-400` | #2dd4bf | Destaques, glow effects |
| `brand-500` | #14b8a6 | Cor principal, botões |
| `brand-600` | #0d9488 | Hover states |
| `dark-bg` | #0f172a | Fundo principal |
| `dark-surface` | #1e293b | Cards, containers |

### Tipografia

- **Rajdhani**: Títulos e números de score
- **Outfit**: Texto corpo e labels

---

## 📊 Métricas

| Métrica | Target | Status |
|---------|--------|--------|
| Performance | 60fps estáveis | ✅ |
| Load Time | < 2 segundos | ✅ |
| Jogos | 10 completos | ✅ |
| Bugs críticos | 0 | ✅ |
| Compatibilidade | Chrome, Firefox, Edge, Safari | ✅ |

---

### Autores

**Abner Magalhães**
- 🔗 LinkedIn: [@abner-magalhaes](https://www.linkedin.com/in/abner-magalhaes-/)
- 💻 GitHub: [@abner-magal](https://github.com/abner-magal)

### Convenções de Código

- **JavaScript**: Classes em PascalCase, funções em camelCase
- **CSS**: Classes em kebab-case, variáveis CSS para tokens
- **HTML**: IDs para JS, classes para estilos

---

## 🔗 Links

- **Landing Page**: `public/index.html`
- **Configuração**: `public/config/games.json`

---

<p align="center">
  Feito com ❤️ e Vanilla JavaScript
</p>
