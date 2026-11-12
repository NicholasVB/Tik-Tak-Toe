class NetworkManager {
    constructor() {
        this.socket = null;
        this.role = null; // 'x' or 'o'
        this.user_pick_callback = null;
        this.on_start_game_callback = null;
        this.on_waiting_callback = null;
    }

    connect(room_code) {
        this.socket = io();
        
        this.socket.on('waiting', (msg) => {
            console.log(msg);
            if (this.on_waiting_callback) this.on_waiting_callback(msg);
        });
        this.socket.on('assign_role', (data) => {
            this.role = data.role;
            console.log(`Ваша роль у грі: ${this.role}`);
        });

        this.socket.on('start_game', () => {
            console.log('Гра почалась!');
            if (this.on_start_game_callback) this.on_start_game_callback();
        });

        this.socket.on('game_update', (data) => {
            if (this.user_pick_callback) {
                this.user_pick_callback(data);
            }
        });
        this.socket.on('timer_tick', (data) => {
            if (this.timer_tick_callback) {
                this.timer_tick_callback(data);
            } 
        });

        this.socket.on('time_out', (data) => {
            if (this.time_out_callback) {
                this.time_out_callback(data);
            }    
        });
    }

    send_user_pick(row, col) {
        this.socket.emit('user_pick', { row, col, player: this.role });
    }

    on_receive_user_pick(callback) {
        this.user_pick_callback = callback;
    }
    
    on_timer_tick(callback) {
        this.timer_tick_callback = callback;
    }
    
    on_time_out(callback) {
        this.time_out_callback = callback;
    }

    onStartGame(callback) {
        this.on_start_game_callback = callback;
    }

    onWaiting(callback) {
        this.on_waiting_callback = callback;
    }
}

export const network = new NetworkManager();