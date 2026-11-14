class NetworkManager {
    socket = null;
    role = null; // 'x' or 'o'
    listeners = {}

    on(event, callback) { // реєструєм колбеки для подій від сервера
        this.listeners[event] = callback
        if (this.socket) {
            this._bind_socket_event(event)
        }
    }

    _emit(event, data) { // запускаєм колбек, коли сервер прислав для нього данні (data)
        if (this.listeners[event]) {
            this.listeners[event](data)
        }
    }
    
    _bind_socket_event(event) {
        this.socket.off(event); // захист, щоб не було дублювань
        this.socket.on(event, (data) => { // через socket.on отримуєм дані від сервера  
            this._emit(event, data);
        });
    }

    connect() {
        this.socket = io();

        for (const event of Object.keys(this.listeners)) {
            this._bind_socket_event(event);
        }
    }

    send(event, data) {
        this.socket.emit(event, data);
    }
}

export const network = new NetworkManager();