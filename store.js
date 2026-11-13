export function is_cell_empty(game_state, row, col, number_of_tiles) {
    if (
        row < 0 || row >= number_of_tiles || 
        col < 0 || col >= number_of_tiles
    ) {
        return false;
    }
    return game_state[row][col] === "";
}

export function create_store(board_size = 5) {
    return {
        ability: [],
        turn: "x",
        round: 1,
        number_of_tiles: board_size,
        tile_size: 75,
        game_state: Array(board_size).fill("").map(row => Array(board_size).fill("")),
        
        switch_turn() {
            this.turn = this.turn === "x" ? "o" : "x";
        },

        change_game_state(row, col, player) {
            this.game_state[row][col] = player;
        },

        reset_game_state(board_size = 5) {
            this.game_state = Array(board_size).fill("").map(row => Array(board_size).fill(""));
        }
    }
}