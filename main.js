import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';
import { timerText, startTurnTimer, resetTimer, stopTimer } from './timer.js'
import { game_store } from './store.js';

async function setup(game_state) {
    const Ximg = await PIXI.Assets.load('assets/x.png');
    const Oimg = await PIXI.Assets.load('assets/o.png');

    const app = new PIXI.Application();
    await app.init({ 
        canvas: document.querySelector('.canvas'),
        width: 800, 
        height: 600,
        backgroundColor: '#ffe4c4',    
    });
    
    startTurnTimer(() => {
        handleTimeOut(Ximg, Oimg);
    });

    const preview_sprite = new PIXI.Sprite()
    preview_sprite.alpha = 0.5;
    preview_sprite.visible = false;
    const grid_graphics = new PIXI.Graphics();
    const highlights_graphics = new PIXI.Graphics();
    const pieces_container = new PIXI.Container();
    draw_lines(grid_graphics, game_store.number_of_tiles, game_store.tile_size)
    draw_state(game_state, Ximg, Oimg, pieces_container, game_store.tile_size)
    
    const main_container = new PIXI.Container();
    main_container.eventMode = 'static'
    main_container.hitArea = new PIXI.Rectangle(0, 0, (game_store.tile_size * game_store.number_of_tiles), (game_store.tile_size * game_store.number_of_tiles));
    main_container.x = (app.screen.width - (game_store.tile_size * game_store.number_of_tiles)) / 2;
    main_container.y = (app.screen.height - (game_store.tile_size * game_store.number_of_tiles)) / 2;

    app.stage.addChild(main_container);
    timerText.x = app.screen.width * 0.9;
    timerText.y = app.screen.height * 0.1;
    app.stage.addChild(timerText);
    main_container.addChild(grid_graphics);
    main_container.addChild(highlights_graphics);
    main_container.addChild(preview_sprite);
    main_container.addChild(pieces_container);

    main_container.on('pointerdown', (event) => {
        const [row, col] = get_click_row_col(event, main_container);
        if (game_store.is_cell_empty(row, col)) {
            game_store.change_game_state(row, col, game_store.turn);
        }
        draw_state(game_state, Ximg, Oimg, pieces_container, game_store.tile_size);

        const pos = main_container.toLocal(event.global);
        update_cursor_effects(pos, preview_sprite, highlights_graphics, Ximg, Oimg, game_store.tile_size);
        const winner = check_win(game_state)
        if (winner !== "") {
            stopTimer();
            return;
        }
        game_store.switch_turn()
        resetTimer(() => { handleTimeOut(Ximg, Oimg); })
    });

    main_container.on('pointermove', (event) => {
        const pos = main_container.toLocal(event.global);
        update_cursor_effects(pos, preview_sprite, highlights_graphics, Ximg, Oimg, game_store.tile_size);
    });

    main_container.on('pointerout', (event) => {
        draw_backlight(highlights_graphics, [], game_store.tile_size);
        preview_sprite.visible = false;
    })
}

function update_cursor_effects(local_pos, preview_sprite, highlights_graphics, Ximg, Oimg, tile_size) {
    const col = Math.floor(local_pos.x / tile_size);
    const row = Math.floor(local_pos.y / tile_size);
    if (
        row >= 0 && row < game_store.number_of_tiles && 
        col >= 0 && col < game_store.number_of_tiles && 
        game_store.game_state[row][col] === ""
    ) {
        draw_backlight(highlights_graphics, [{ row, col }], tile_size, 0x0088ff, 0.2);
        preview_sprite.texture = game_store.turn === 'x' ? Ximg : Oimg;
        preview_sprite.width = tile_size * 0.8
        preview_sprite.height = tile_size * 0.8
        preview_sprite.x = col * tile_size + tile_size * 0.2 / 2
        preview_sprite.y = row * tile_size + tile_size * 0.2 / 2
        preview_sprite.visible = true;
    } else {
        draw_backlight(highlights_graphics, [], tile_size);
        preview_sprite.visible = false;
    }
}

function handleTimeOut(Ximg, Oimg) {
    game_store.switch_turn();
    startTurnTimer(() => {
        handleTimeOut(Ximg, Oimg);
    });
}

function draw_backlight(graphics, cells_to_backlight, tile_size, color = 0x00ff00, alpha = 0.3, padding = 2) {
    graphics.clear();
    if (!cells_to_backlight || cells_to_backlight.length === 0) return;
    graphics.fill({ color: color, alpha: alpha });
    for (const cell of cells_to_backlight) {
        const x = cell.col * tile_size;
        const y = cell.row * tile_size;
        graphics.rect(
            x + padding, 
            y + padding, 
            tile_size - padding * 2, 
            tile_size - padding * 2
        );
    }
    graphics.fill();
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

function get_click_row_col(event, container){
    const pos = container.toLocal(event.global);
    const col = Math.floor(pos.x / game_store.tile_size);
    const row = Math.floor(pos.y / game_store.tile_size);
    return [row, col]
}
   
function draw_state(state, Ximg, Oimg, container, tile_size){
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

setup(game_store.game_state);