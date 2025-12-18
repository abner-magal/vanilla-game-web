const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// ═══════════════════════════════════════════════════
// Hamburger Menu - Mobile Navigation
// ═══════════════════════════════════════════════════
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (!hamburgerBtn || !navLinks) {
        console.warn('Hamburger menu elements not found');
        return;
    }
    
    // Toggle menu on hamburger click
    const toggleMenu = () => {
        const isOpen = navLinks.classList.contains('active');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };
    
    const openMenu = () => {
        navLinks.classList.add('active');
        hamburgerBtn.classList.add('active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
    };
    
    const closeMenu = () => {
        navLinks.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    };
    
    // Event listener for hamburger button
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isMenuOpen = navLinks.classList.contains('active');
        const clickedInsideMenu = navLinks.contains(e.target);
        const clickedHamburger = hamburgerBtn.contains(e.target);
        
        if (isMenuOpen && !clickedInsideMenu && !clickedHamburger) {
            closeMenu();
        }
    });
    
    // Close menu when clicking on a nav link
    const navLinkElements = navLinks.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
            hamburgerBtn.focus();
        }
    });
    
    // Close menu on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeMenu();
        }
    });
    
    // Sync mobile search with desktop search
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const desktopSearchInput = document.getElementById('searchInput');
    
    if (mobileSearchInput && desktopSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            desktopSearchInput.value = e.target.value;
            desktopSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        desktopSearchInput.addEventListener('input', (e) => {
            mobileSearchInput.value = e.target.value;
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Defensive guard: prevents double-initialization (e.g., if the script is injected twice)
    if (window.__bnGamesGameLoaderInitialized) return;
    window.__bnGamesGameLoaderInitialized = true;

    // Initialize hamburger menu
    initHamburgerMenu();
    try {
        const response = await fetch('config/games.json');
        const rawData = await response.json();
        const gamesGrid = document.getElementById('gamesGrid');
        const categoryFilters = document.getElementById('categoryFilters');
        const searchInput = document.getElementById('searchInput');

        const searchUtils = await ensureSearchUtils();

        const state = {
            category: 'Todos',
            searchTerm: ''
        };

        // Remove duplicates defensively (a hub must not show duplicated game cards).
        // If two items share the same title, we keep the one with the "more canonical" path
        // (heuristic: fewer uppercase letters).
        const countUppercase = (value) => {
            const str = String(value || '');
            let count = 0;
            for (const ch of str) {
                if (ch >= 'A' && ch <= 'Z') count++;
            }
            return count;
        };

        const byTitle = new Map();
        for (const game of Array.isArray(rawData) ? rawData : []) {
            const key = String(game?.title || '').trim().toLowerCase();
            if (!key) continue;

            const existing = byTitle.get(key);
            if (!existing) {
                byTitle.set(key, game);
                continue;
            }

            const existingUpper = countUppercase(existing?.path);
            const currentUpper = countUppercase(game?.path);
            if (currentUpper < existingUpper) {
                byTitle.set(key, game);
            }
        }

        const data = Array.from(byTitle.values());

        // Extract unique categories
        const categories = ['Todos', ...new Set(data.map(game => game.category))];

        // Search handler with debounce
        if (searchInput) {
            const handleSearch = debounce((value) => {
                state.searchTerm = value;
                applyFilters();
            }, 300);

            searchInput.addEventListener('input', (event) => {
                handleSearch(event.target.value || '');
            });
        } else {
            console.warn('Elemento de busca #searchInput não encontrado. Busca desabilitada.');
        }

        // Render Category Buttons
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = `px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border border-slate-700 ${category === 'Todos' ? 'bg-brand-600 text-white border-brand-500' : 'bg-dark-surface text-slate-400 hover:text-white hover:border-brand-500'}`;
            btn.textContent = category;
            btn.dataset.category = category;

            btn.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('#categoryFilters button').forEach(b => {
                    b.className = 'px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border border-slate-700 bg-dark-surface text-slate-400 hover:text-white hover:border-brand-500';
                });
                btn.className = 'px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border border-brand-500 bg-brand-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]';

                state.category = category;
                applyFilters();
            });

            categoryFilters.appendChild(btn);
        });

        // Initial Render with filters applied
        applyFilters();

        function applyFilters() {
            const byCategory = state.category === 'Todos'
                ? data
                : data.filter(game => game.category === state.category);

            const filteredGames = (searchUtils && typeof searchUtils.filterGames === 'function')
                ? searchUtils.filterGames(byCategory, state.searchTerm)
                : fallbackFilter(byCategory, state.searchTerm);

            renderGames(filteredGames);
        }

        function renderGames(games) {
            gamesGrid.innerHTML = ''; // Clear existing

            if (!games || games.length === 0) {
                gamesGrid.innerHTML = `
                    <div class="col-span-full text-center py-10 text-slate-400">
                        <p class="text-lg font-bold text-white mb-2">Nenhum jogo encontrado</p>
                        <p class="text-sm text-slate-500 mb-4">Tente limpar a busca ou escolher outra categoria.</p>
                        ${searchInput ? '<button type="button" id="clearSearchBtn" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-surface border border-slate-700 text-slate-200 hover:border-brand-500 hover:text-white transition-colors">Limpar busca</button>' : ''}
                    </div>
                `;

                const clearBtn = document.getElementById('clearSearchBtn');
                if (clearBtn && searchInput) {
                    clearBtn.addEventListener('click', () => {
                        searchInput.value = '';
                        state.searchTerm = '';
                        applyFilters();
                        searchInput.focus();
                    });
                }
                return;
            }

            games.forEach((game, index) => {
                const card = document.createElement('div');
                card.className = 'group relative bg-dark-surface rounded-2xl overflow-hidden border border-slate-700 hover:border-brand-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:-translate-y-2 animate-fade-in';
                card.style.animationDelay = `${index * 50}ms`;
                card.style.animationFillMode = 'forwards';

                // Fallback for image if empty
                const thumbnailSrc = game.image || `https://placehold.co/600x400/1e293b/14b8a6?text=${encodeURIComponent(game.title)}`;

                card.innerHTML = `
                    <div class="aspect-video overflow-hidden relative">
                        <div class="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent z-10 opacity-60"></div>
                        <img src="${thumbnailSrc}" alt="${game.title}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute top-3 right-3 z-20">
                            <span class="px-2 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                                ${game.category || 'Arcade'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-6 relative z-20">
                        <h3 class="text-xl font-display font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">${game.title}</h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">${game.description}</p>
                        
                        <a href="${game.path}" class="inline-flex items-center gap-2 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors">
                            <span class="material-symbols-outlined text-lg">play_circle</span>
                            Jogar Agora
                        </a>
                    </div>
                `;

                gamesGrid.appendChild(card);
            });
        }

        async function ensureSearchUtils() {
            if (window.SearchUtils) return window.SearchUtils;
            try {
                const module = await import('./search-utils.js');
                return module?.default || window.SearchUtils;
            } catch (err) {
                console.warn('SearchUtils não pôde ser carregado. Será usado fallback simples.', err);
                return null;
            }
        }

        function debounce(fn, delay) {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn(...args), delay);
            };
        }

        function fallbackFilter(games, term) {
            if (!term) return games;
            const normalizedTerm = String(term).trim().toLowerCase();
            if (!normalizedTerm) return games;

            if (normalizedTerm.length === 1) {
                return games.filter(game => (game?.title || '').toLowerCase().startsWith(normalizedTerm));
            }

            return games.filter(game => {
                const title = (game?.title || '').toLowerCase();
                const description = (game?.description || '').toLowerCase();
                return title.includes(normalizedTerm) || description.includes(normalizedTerm);
            });
        }

    } catch (error) {
        console.error('Error loading games:', error);
    }
});
