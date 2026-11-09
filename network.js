class NetworkManager {
    constructor() {
        this.socket = null;
        this.role = null; // 'x' or 'o'
        this.user_pick_callback = null;
        this.onStartGameCallback = null;
        this.onWaitingCallback = null;
    }

    connect(roomCode) {
        this.socket = io('http://localhost:3000');
        
        this.socket.on('waiting', (msg) => {
            console.log(msg);
            if (this.onWaitingCallback) this.onWaitingCallback(msg);
        });
        this.socket.on('assign_role', (data) => {
            this.role = data.role;
            console.log(`Ваша роль в игре: ${this.role}`);
        });

        this.socket.on('start_game', () => {
            console.log('Игра началась!');
            if (this.onStartGameCallback) this.onStartGameCallback();
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
        this.onStartGameCallback = callback;
    }

    onWaiting(callback) {
        this.onWaitingCallback = callback;
    }
}

export const network = new NetworkManager();