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
        turn = turn === "x" ? "o" : "x";
    });
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

setup(test_game_state);