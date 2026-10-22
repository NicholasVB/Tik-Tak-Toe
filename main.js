let turn = "X"
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

async function setup() {
    await app.init({ 
        canvas: document.querySelector('.canvas'),
        width: 800, 
        height: 600,
        backgroundColor: '#ffe4c4',    
    });

    const Ximg = await PIXI.Assets.load('assets/x.png');
    const Oimg = await PIXI.Assets.load('assets/o.png');
    const sprite_X = new PIXI.Sprite(Ximg);
    const sprite_O = new PIXI.Sprite(Oimg);

    draw_state(test_game_state, Ximg, Oimg, app)

}

function draw_state(state, Ximg, Oimg, app){
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
            app.stage.addChild(sprite);
        }
    }
}

setup();