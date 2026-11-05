import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';
import { timerText, startTurnTimer, resetTimer, stopTimer } from './timer.js'
import { game_store } from './store.js';
import { create_board_view } from './view.js';
import { network } from './network.js';

async function setup(game_state) {
    network.connect("room_123");
    
    network.on_receive_user_pick((data) => {
        game_store.change_game_state(data.row, data.col, data.player);
        board_view.draw_state();
        const winner = check_win(data.game_state)
        if (winner !== "") {
            stopTimer();
            return;
        }
        game_store.turn = data.turn;
        resetTimer(() => { handle_time_out(); });
    });

    const Ximg = await PIXI.Assets.load('assets/x.png');
    const Oimg = await PIXI.Assets.load('assets/o.png');

    const app = new PIXI.Application();
    await app.init({ 
        canvas: document.querySelector('.canvas'),
        width: 800, 
        height: 600,
        backgroundColor: '#ffe4c4',    
    });
    
    const board_view = create_board_view(game_store, Ximg, Oimg);
    board_view.draw_lines();
    board_view.draw_state();
    
    board_view.main_container.x = (app.screen.width - (game_store.tile_size * game_store.number_of_tiles)) / 2;
    board_view.main_container.y = (app.screen.height - (game_store.tile_size * game_store.number_of_tiles)) / 2;

    app.stage.addChild(board_view.main_container);
    timerText.x = app.screen.width * 0.9;
    timerText.y = app.screen.height * 0.1;
    app.stage.addChild(timerText);
    

    let last_mouse_pos = { x: 0, y: 0 };
    function handle_time_out() {
        game_store.switch_turn();
        board_view.update_cursor_effects(last_mouse_pos);
        startTurnTimer(() => {
            handle_time_out();
        });
    }

    startTurnTimer(() => {
        handle_time_out();
    });

    board_view.main_container.on('pointerdown', (event) => {
        if (game_store.turn !== network.role) return;
        
        const [row, col] = get_click_row_col(event, board_view.main_container);
        if (game_store.is_cell_empty(row, col)) {
            network.send_user_pick(row, col);
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

function get_click_row_col(event, container){
    const pos = container.toLocal(event.global);
    const col = Math.floor(pos.x / game_store.tile_size);
    const row = Math.floor(pos.y / game_store.tile_size);
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
game_store.reset_game_state()
setup(game_store.game_state);