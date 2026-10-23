import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';

let current_turn_time = 10;
let turn_timer = null; 
const seconds_in_round = 10;

export function startTurnTimer(onTimeOut) {
    if (turn_timer) {
        clearInterval(turn_timer);
    }
    current_turn_time = seconds_in_round;
    timerText.text = `${current_turn_time}`

    turn_timer = setInterval(() => {
        current_turn_time--;
        timerText.text = `${current_turn_time}`
        if (current_turn_time <= 0) {
            clearInterval(turn_timer);
            if (onTimeOut) {
                onTimeOut()
            }
        }
    }, 1000);
}

export function resetTimer(onTimeOut) {
    startTurnTimer(onTimeOut);
}

export function stopTimer() {
    if (turn_timer) {
        clearInterval(turn_timer);
    }
}

export const timerText = new PIXI.Text({
    text: 'Время: 10',
    style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
    }
});