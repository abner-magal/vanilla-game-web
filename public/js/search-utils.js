class SearchUtils {
    static normalize(str) {
        if (str === undefined || str === null) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    static matches(text, searchTerm) {
        const normalizedText = SearchUtils.normalize(text);
        const normalizedTerm = SearchUtils.normalize(searchTerm).trim();

        if (normalizedTerm.length === 0) return true;
        if (normalizedTerm.length === 1) {
            return normalizedText.startsWith(normalizedTerm);
        }

        return normalizedText.includes(normalizedTerm);
    }

    static filterGames(games, searchTerm) {
        if (!Array.isArray(games)) return [];

        const normalizedTerm = SearchUtils.normalize(searchTerm).trim();
        if (normalizedTerm.length === 0) {
            return [...games];
        }

        if (normalizedTerm.length === 1) {
            return games.filter(game =>
                SearchUtils.matches(game?.title ?? '', normalizedTerm)
            );
        }

        return games.filter(game => {
            const title = game?.title ?? '';
            const description = game?.description ?? '';
            return (
                SearchUtils.matches(title, normalizedTerm) ||
                SearchUtils.matches(description, normalizedTerm)
            );
        });
    }
}

export default SearchUtils;

if (typeof window !== 'undefined') {
    window.SearchUtils = SearchUtils;
}
