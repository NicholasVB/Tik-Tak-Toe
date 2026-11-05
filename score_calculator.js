const SCORE_TABLE = {
    2: 2,
    3: 5,
    4: 10,
    5: 20
};

function find_all_possible_lines(board_state, player) {
    const size = board_state.length;
    const lines = [];
    // допоміжна функція для перевірки та додавання ліній
    function check_and_add_segment(cells) {
        // перевіряємо, що всі клітини у відрізку належать гравцю
        const isValid = cells.every(([row, column]) => board_state[row][column] === player);
        if (isValid && cells.length >= 2) {
            lines.push({
                length: cells.length,
                score: SCORE_TABLE[cells.length] || (cells.length * 3), // формула, якщо довжина більше таблиці
                cells: cells // масив координат [[row,column], [row,column], ...]
            });
        }
    }

    // скануємо горизонталі
    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            // Пробуем собрать отрезки разной длины, начиная с текущей клетки
            for (let len = 2; len <= size - column; len++) {
                const segment = [];
                for (let i = 0; i < len; i++) segment.push([row, column + i]);
                check_and_add_segment(segment);
            }
        }
    }

    // скануємо вертикалі
    for (let column = 0; column < size; column++) {
        for (let row = 0; row < size; row++) {
            for (let len = 2; len <= size - row; len++) {
                const segment = [];
                for (let i = 0; i < len; i++) segment.push([row + i, column]);
                check_and_add_segment(segment);
            }
        }
    }

    // скануємо діагоналі (вправо-вниз)
    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            for (let len = 2; len <= Math.min(size - row, size - column); len++) {
                const segment = [];
                for (let i = 0; i < len; i++) segment.push([row + i, column + i]);
                check_and_add_segment(segment);
            }
        }
    }

    // скануємо діагоналі (ліворуч-вниз)
    for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
            for (let len = 2; len <= Math.min(size - row, column + 1); len++) {
                const segment = [];
                for (let i = 0; i < len; i++) segment.push([row + i, column - i]);
                check_and_add_segment(segment);
            }
        }
    }

    return lines;
}

// пошук максимальної суми очок без перетину фішок (Backtracking)
export function calculate_max_score(board_state, player) {
    const all_lines = find_all_possible_lines(board_state, player);
    
    let max_score = 0;

    // рекурсивний перебір із поверненням (Backtracking)
    function backtrack(line_index, current_score, used_cells) {
        if (current_score > max_score) {
            max_score = current_score;
        }

        for (let i = line_index; i < all_lines.length; i++) {
            const line = all_lines[i];
            
            // дивимось, чи не перетинається поточна лінія з уже використаними клітинами
            const has_conflict = line.cells.some(([row, column]) => used_cells.has(`${row},${column}`));

            if (!has_conflict) {
                // позначаємо клітини як зайняті
                const new_used_cells = new Set(used_cells);
                line.cells.forEach(([row, column]) => new_used_cells.add(`${row},${column}`));

                // рекурсія
                backtrack(i + 1, current_score + line.score, new_used_cells);
            }
        }
    }

    backtrack(0, 0, new Set());
    return max_score;
}