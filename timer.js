export function start_room_timer(room, on_tick, on_time_out, seconds = 10) {
    stop_room_timer(room);
    room.current_time = seconds;

    on_tick(room.current_time);

    room.timer = setInterval(() => {
        room.current_time--;
        
        on_tick(room.current_time);

        if (room.current_time <= 0) {
            stop_room_timer(room);
            if (on_time_out) {
                on_time_out();
            }
        }
    }, 1000);
}

export function stop_room_timer(room) {
    if (room && room.timer) {
        clearInterval(room.timer);
        room.timer = null;
    }
}