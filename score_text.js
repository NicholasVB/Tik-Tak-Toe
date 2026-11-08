import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';

export function create_score_text(score) {
    const score_text = new PIXI.Text({
        text: `Балів: ${score}`,
        style: {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
        }
    });
    return score_text;
}