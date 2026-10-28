export const game_store = {
    turn: "x",
    round: 1,
    number_of_tiles: 5,
    tile_size: 75,
    ability: [],
    
    game_state: [
        ["x", "x", "o", "x", "o"],
        ["o", "o", "o", "o", ""],
        ["", "", "", "", ""],
        ["", "", "o", "", ""],
        ["x", "x", "", "x", "x"]
    ],

    switch_turn() {
        this.turn = this.turn === "x" ? "o" : "x";
    },

    is_cell_empty(row, col) {
        if (
            row < 0 || row >= this.number_of_tiles || 
            col < 0 || col >= this.number_of_tiles
        ) {
            return false;
        }
        return this.game_state[row][col] === "";
    },

    change_game_state(row, col, player) {
        this.game_state[row][col] = player;
    },

    reset_game_state() {
        this.game_state = [
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""]
        ]
    }
};