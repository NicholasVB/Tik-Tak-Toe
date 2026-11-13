const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { create_store, is_cell_empty } = require('../store');
const { start_room_timer, stop_room_timer } = require('../timer.js');

const app = express();
path_to_static = path.join(__dirname)+"\\..";
app.use(express.static(path_to_static));
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:3000 ws://localhost:3000 http://192.168.1.104:3000 ws://192.168.1.104:3000;"
    );
    next();
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // дозволено підключення з любих адрес
        methods: ["GET", "POST"]
    }
});

let waiting_player = null;
const rooms = {};

function init_room_timer(target_room_name) {
    const room = rooms[target_room_name];
    if (!room) return;

    start_room_timer(
        room,
        (time) => {
            if (rooms[target_room_name]) {
                io.to(target_room_name).emit('timer_tick', { 
                    time: time, 
                    current_player: room.store.turn 
                });
            }
        },
        () => {
            if (!rooms[target_room_name]) return;

            room.store.switch_turn();
            io.to(target_room_name).emit('time_out', { current_player: room.store.turn });
            // перезапускаємо таймер для наступного гравця
            init_room_timer(target_room_name);
        }
    );
}

io.on('connection', (socket) => {
    console.log(`Перший гравець підключився: ${socket.id}`);
    if (!waiting_player) {
        waiting_player = socket;
        socket.emit('waiting', 'Очікуєм другого гравця...');
    } else {
        // приєднався другий гравець, створюєм кімнату
        const room_name = `room_${waiting_player.id}_${socket.id}`;
        socket.join(room_name);
        waiting_player.join(room_name);
        socket.room = room_name;
        waiting_player.room = room_name;

        rooms[room_name] = {
            store: create_store(5),
            players: {
                [waiting_player.id]: "x",
                [socket.id]: "o"
            },
            timer: null,
            current_time: 10
        }
        console.log(`Кімната ${room_name} створена. Гравці: ${waiting_player.id} (X) и ${socket.id} (O)`);

        // даем ролі гравцям
        io.to(room_name).emit('start_game', { room: room_name });
        waiting_player.emit('assign_role', { role: 'x' });
        socket.emit('assign_role', { role: 'o' });
        
        // запускаєм таймер при створенні кімнати
        init_room_timer(room_name);
        waiting_player = null;
    }

    socket.on('user_pick', (data) => {
        console.log(`Хід гравця ${data.player}: row=${data.row}, col=${data.col}`);
        const room = rooms[socket.room];
        if (!room) return;
        const role = room.players[socket.id];
        if (role !== room.store.turn) return;
        
        if (is_cell_empty(room.store.game_state, data.row, data.col, room.store.number_of_tiles)) {
            room.store.change_game_state(data.row, data.col, data.player)
            room.store.switch_turn()
            io.to(socket.room).emit(
                'game_update', 
                { 
                    row: data.row, 
                    col: data.col, 
                    player: data.player,
                    turn: room.store.turn,
                    game_state: room.store.game_state
                }
            );
            init_room_timer(socket.room);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Гравець відключився: ${socket.id}`);
        if (waiting_player === socket) {
            waiting_player = null;
        }
        delete rooms[socket.room];
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});