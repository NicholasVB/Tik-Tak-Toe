let turn = "x"
let game_state  = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
]

let test_game_state  = [
    ["x", "x", "o", "x", "o"],
    ["o", "o", "o", "o", ""],
    ["", "", "", "", ""],
    ["", "", "o", "", ""],
    ["x", "x", "", "x", "x"]
]

let tile_size = 75
let round = 1
let seconds_in_round = 10
let ability = []

import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';
const app = new PIXI.Application();

async function setup(game_state) {
    await app.init({ 
        canvas: document.querySelector('.canvas'),
        width: 800, 
        height: 600,
        backgroundColor: '#ffe4c4',    
    });

    const Ximg = await PIXI.Assets.load('assets/x.png');
    const Oimg = await PIXI.Assets.load('assets/o.png');
    
    const grid_graphics = new PIXI.Graphics();
    draw_lines(grid_graphics, 5, tile_size)
    app.stage.addChild(grid_graphics);
    
    const pieces_container = new PIXI.Container();
    app.stage.addChild(pieces_container);
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen;
    draw_state(game_state, Ximg, Oimg, pieces_container)
    
    app.stage.on('pointerdown', (event) => {
        const [row, col] = get_click_row_col(event);
        if (game_state[row][col] !== "") {
            return;
        }
        game_state[row][col] = turn;
        draw_state(game_state, Ximg, Oimg, pieces_container)
        const winner = check_win(game_state)
        if (winner !== "") {
            console.log(winner)
        }
        turn = turn === "x" ? "o" : "x";
    });
}

function draw_lines(graphics, count_of_lines, tile_size) {
    const total_length = count_of_lines * tile_size;
    graphics.beginPath();
    for (let pos_coef = 0; pos_coef <= count_of_lines; pos_coef++) {
        const pos = pos_coef * tile_size;
        graphics.moveTo(pos, 0);
        graphics.lineTo(pos, total_length);
        graphics.moveTo(0, pos);
        graphics.lineTo(total_length, pos);
    }
    graphics.stroke({ width: tile_size * 0.1, color: 0x666666 });
}

function get_click_row_col(event){
    const pos = event.global;
    const col = Math.floor(pos.x / tile_size);
    const row = Math.floor(pos.y / tile_size);
    return [row, col]
}
   
function draw_state(state, Ximg, Oimg, container){
    container.removeChildren()
    for (let row = 0; row < state.length; row++) {
        for (let col = 0; col < state[row].length; col++) {
            if (state[row][col] == "") {continue}
            let sprite
            if (state[row][col] == "x") {
                sprite = new PIXI.Sprite(Ximg);
            } else {
                sprite = new PIXI.Sprite(Oimg);
            }
            sprite.width = tile_size * 0.8
            sprite.height = tile_size * 0.8
            sprite.x = col * tile_size + tile_size * 0.2 / 2
            sprite.y = row * tile_size + tile_size * 0.2 / 2
            container.addChild(sprite);
        }
    }
}

function check_win(game_state){
    for (let row = 0; row < game_state.length; row++) {
        const line = game_state[row]
        if (line.every(element => element === 'x')) { return "x" }
        if (line.every(element => element === 'o')) { return "o" }
    }
    for (let col = 0; col < game_state.length; col++) {
        const column = game_state.map(row => row[col]);
        if (column.every(element => element === 'x')) { return "x" }
        if (column.every(element => element === 'o')) { return "o" }
    }
      
    return "";
}

setup(test_game_state);