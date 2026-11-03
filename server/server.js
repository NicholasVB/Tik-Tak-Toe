const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { game_store } = require('../store');

function switch_turn(turn) {
    return turn === "x" ? "o" : "x";
}

function is_cell_empty(row, col, game_state, number_of_tiles) {
    if (
        row < 0 || row >= number_of_tiles || 
        col < 0 || col >= number_of_tiles
    ) {
        return false;
    }
    return game_state[row][col] === "";
}

function change_game_state(row, col, player, game_state) {
    game_state[row][col] = player;
}

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
        origin: "*", // Разрешаем подключения с любых адресов для разработки
        methods: ["GET", "POST"]
    }
});

// Простая очередь ожидания игроков для создания комнат
let waitingPlayer = null;
const rooms = {};

io.on('connection', (socket) => {
    console.log(`Игрок подключился: ${socket.id}`);

    // Логика распределения игроков по комнатам (по 2 человека)
    if (!waitingPlayer) {
        waitingPlayer = socket;
        
        socket.emit('waiting', 'Ожидание второго игрока...');
        console.log(`Игрок ${socket.id} назначен как X и ждет оппонента.`);
    } else {
        // Второй игрок найден, создаем комнату (он будет ноликом 'o')
        const room_name = `room_${waitingPlayer.id}_${socket.id}`;
        socket.join(room_name);
        waitingPlayer.join(room_name);
        socket.room = room_name;
        waitingPlayer.room = room_name;

        rooms[room_name] = {
            number_of_tiles: game_store.number_of_tiles,
            turn: "x",
            game_state: Array(game_store.number_of_tiles).fill(0).map(() => Array(game_store.number_of_tiles).fill("")),
            players: {
                [waitingPlayer.id]: "x",
                [socket.id]: "o"
            }
        }
        console.log(`Комната ${room_name} создана. Игроки: ${waitingPlayer.id} (X) и ${socket.id} (O)`);

        // Оповещаем обоих, что игра началась, и раздаем роли
        io.to(room_name).emit('start_game', { room: room_name });
        waitingPlayer.emit('assign_role', { role: 'x' });
        socket.emit('assign_role', { role: 'o' });
        waitingPlayer = null; // сбрасываем очередь
    }

    socket.on('user_pick', (data) => {
        console.log(`Ход от игрока ${data.player}: row=${data.row}, col=${data.col}`);
        const room = rooms[socket.room];
        if (!room) return;
        const role = room.players[socket.id];
        if (role !== room.turn) return;
        
        if (is_cell_empty(data.row, data.col, room.game_state, room.number_of_tiles)) {
            change_game_state(data.row, data.col, data.player, room.game_state)
            room.turn = switch_turn(room.turn)
            io.to(socket.room).emit(
                'game_update', 
                { 
                    row: data.row, 
                    col: data.col, 
                    player: data.player,
                    turn: room.turn,
                    game_state: room.game_state
                }
            );
        }
    });

    socket.on('disconnect', () => {
        console.log(`Игрок отключился: ${socket.id}`);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
        delete rooms[socket.room];
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});