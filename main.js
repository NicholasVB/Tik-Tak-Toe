import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';
import { create_store, is_cell_empty } from './store.js';
import { create_board_view } from './view.js';
import { network } from './network.js';
import { calculate_max_score } from './score_calculator.js'
import { create_score_text } from './score_text.js';

const timer_text = new PIXI.Text({
    text: '',
    style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
    }
});

async function setup() {
    const Ximg = await PIXI.Assets.load('assets/x.png');
    const Oimg = await PIXI.Assets.load('assets/o.png');

    const app = new PIXI.Application();
    await app.init({ 
        canvas: document.querySelector('.canvas'),
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#ffe4c4',
        resizeTo: window // автоматично міняти розмір при повороті екрану
    });
    const game_store = create_store(5);
    
    network.connect();
    
    network.on("game_update", (data) => {
        game_store.change_game_state(data.row, data.col, data.player);
        board_view.draw_state();
        const winner = check_win(data.game_state)
        if (network.role === data.player) {
            score_text.text = `Балів: ${calculate_max_score(data.game_state, data.player)}`
        }
        game_store.turn = data.turn;
    });

    network.on("assign_role", (data) => {
        network.role = data.role;
        console.log(`Ваша роль у грі: ${network.role}`);
    });

    network.on("timer_tick", (data) => {
        timer_text.text = `${data.time}`;
        game_store.turn = data.current_player;
    });
    
    let last_mouse_pos = { x: 0, y: 0 };
    network.on("time_out", (data) => {
        game_store.turn = data.current_player;
        board_view.update_cursor_effects(last_mouse_pos);
    });

    const board_view = create_board_view(app.screen.width, app.screen.height, game_store, Ximg, Oimg);
    app.renderer.on('resize', () => { 
        board_view.resize_and_positioning_main_container(app.screen.width, app.screen.height);
    });
    board_view.draw_lines();
    board_view.draw_state();

    app.stage.addChild(board_view.main_container);
    timer_text.x = app.screen.width * 0.7;
    timer_text.y = app.screen.height * 0.1;
    app.stage.addChild(timer_text);
    const score_text = create_score_text(0);
    score_text.x = app.screen.width * 0.43;
    score_text.y = app.screen.height * 0.1;
    app.stage.addChild(score_text);

    board_view.main_container.on('pointerdown', (event) => {
        if (game_store.turn !== network.role) return;
        
        const [row, col] = get_click_row_col(event, board_view.main_container, game_store.tile_size);
        if (is_cell_empty(game_store.game_state, row, col, game_store.number_of_tiles)) {
            network.send('user_pick', { row, col, player: network.role }); 
        }

        const pos = board_view.main_container.toLocal(event.global);
        board_view.update_cursor_effects(pos);
    });

    board_view.main_container.on('pointermove', (event) => {
        const pos = board_view.main_container.toLocal(event.global);
        last_mouse_pos = pos;
        board_view.update_cursor_effects(pos);
    });

    board_view.main_container.on('pointerout', (event) => {
        board_view.clear_cell();
    })
}

function get_click_row_col(event, container, tile_size){
    const pos = container.toLocal(event.global);
    const col = Math.floor(pos.x / tile_size);
    const row = Math.floor(pos.y / tile_size);
    return [row, col]
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

setup();