class Grid {
    constructor(rows, cols, defaultValue = null) {
        this.rows = rows;
        this.cols = cols;
        this.grid = Array(rows).fill().map(() => Array(cols).fill(defaultValue));
    }

    get(row, col) {
        if (this.isValid(row, col)) {
            return this.grid[row][col];
        }
        return null;
    }

    set(row, col, value) {
        if (this.isValid(row, col)) {
            this.grid[row][col] = value;
            return true;
        }
        return false;
    }

    isValid(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    clear(value = null) {
        this.grid.forEach(row => row.fill(value));
    }

    forEach(callback) {
        this.grid.forEach((row, r) => {
            row.forEach((cell, c) => {
                callback(cell, r, c);
            });
        });
    }
}
