import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';
import { is_cell_empty } from './store.js';

export function create_board_view(screen_width, screen_height, game_store, Ximg, Oimg) {
    const board_pixel_size = game_store.number_of_tiles * game_store.tile_size;
    
    const preview_sprite = new PIXI.Sprite()
    preview_sprite.alpha = 0.5;
    preview_sprite.visible = false;
    const grid_graphics = new PIXI.Graphics();
    const highlights_graphics = new PIXI.Graphics();
    const pieces_container = new PIXI.Container();
    const main_container = new PIXI.Container();
    main_container.eventMode = 'static'
    main_container.hitArea = new PIXI.Rectangle(0, 0, board_pixel_size, board_pixel_size);
    main_container.x = (screen_width - board_pixel_size) / 2;
    main_container.y = (screen_height - board_pixel_size) / 2;

    main_container.addChild(grid_graphics);
    main_container.addChild(highlights_graphics);
    main_container.addChild(preview_sprite);
    main_container.addChild(pieces_container);

    return {
        main_container: main_container,

        resize_and_positioning_main_container(screen_width, screen_height){
            const board_pixel_size = game_store.number_of_tiles * game_store.tile_size;
            const padding = 20;
            // зменшити маштаб дошки якщо вона більше екрану телефона 
            const scale_x = (screen_width - padding * 2) / board_pixel_size;
            const scale_y = (screen_height - padding * 2) / board_pixel_size;
            const optimal_scale = Math.min(scale_x, scale_y, 1); 
            main_container.scale.set(optimal_scale);
            // центруєм з врахуванням маштабу
            main_container.x = (screen_width - board_pixel_size * optimal_scale) / 2;
            main_container.y = (screen_height - board_pixel_size * optimal_scale) / 2;
        },
        
        update_cursor_effects(local_pos) {
            const tile_size = game_store.tile_size;
            const col = Math.floor(local_pos.x / tile_size);
            const row = Math.floor(local_pos.y / tile_size);
            if (is_cell_empty(game_store.game_state, row, col, game_store.number_of_tiles)) {
                this.draw_backlight(highlights_graphics, [{ row, col }], tile_size, 0x0088ff, 0.2);
                this.change_sprite_texture(preview_sprite, game_store.turn === 'x' ? Ximg : Oimg)
                this.resize_and_positioning_sprite(preview_sprite, row, col, tile_size)
                preview_sprite.visible = true;
            } else {
                this.clear_cell()
            }
        },

        change_sprite_texture(sprite, img) {
            sprite.texture = img;
        },

        resize_and_positioning_sprite(sprite, row, col, tile_size) {
            sprite.width = tile_size * 0.8
            sprite.height = tile_size * 0.8
            sprite.x = col * tile_size + tile_size * 0.2 / 2
            sprite.y = row * tile_size + tile_size * 0.2 / 2
        },

        clear_cell() {
            this.draw_backlight(highlights_graphics, [], game_store.tile_size);
            preview_sprite.visible = false;
        },
        
        draw_state () {
            pieces_container.removeChildren();
            const state = game_store.game_state;
            const tile_size = game_store.tile_size;

            for (let row = 0; row < state.length; row++) {
                for (let col = 0; col < state[row].length; col++) {
                    if (state[row][col] == "") { continue; }
                    let sprite = new PIXI.Sprite(state[row][col] === "x" ? Ximg : Oimg);
                    this.resize_and_positioning_sprite(sprite, row, col, tile_size)
                    pieces_container.addChild(sprite);
                }
            }
        },

        draw_lines() {
            const count_of_lines = game_store.number_of_tiles;
            const tile_size = game_store.tile_size;
            const total_length = count_of_lines * tile_size;
            grid_graphics.beginPath();
            for (let pos_coef = 0; pos_coef <= count_of_lines; pos_coef++) {
                const pos = pos_coef * tile_size;
                grid_graphics.moveTo(pos, 0);
                grid_graphics.lineTo(pos, total_length);
                grid_graphics.moveTo(0, pos);
                grid_graphics.lineTo(total_length, pos);
            }
            grid_graphics.stroke({ width: tile_size * 0.1, color: 0x666666 });
        },

        draw_backlight(graphics, cells_to_backlight, tile_size, color = 0x00ff00, alpha = 0.3, padding = 2) {
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
    }
}