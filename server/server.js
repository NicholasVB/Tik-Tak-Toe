const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

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

io.on('connection', (socket) => {
    console.log(`Игрок подключился: ${socket.id}`);

    // Логика распределения игроков по комнатам (по 2 человека)
    if (!waitingPlayer) {
        waitingPlayer = socket;
        socket.role = 'x';
        socket.emit('waiting', 'Ожидание второго игрока...');
        console.log(`Игрок ${socket.id} назначен как X и ждет оппонента.`);
    } else {
        // Второй игрок найден, создаем комнату (он будет ноликом 'o')
        const roomName = `room_${waitingPlayer.id}_${socket.id}`;
        socket.join(roomName);
        waitingPlayer.join(roomName);
        socket.room = roomName;
        waitingPlayer.room = roomName;
        socket.role = 'o';
        console.log(`Комната ${roomName} создана. Игроки: ${waitingPlayer.id} (X) и ${socket.id} (O)`);

        // Оповещаем обоих, что игра началась, и раздаем роли
        io.to(roomName).emit('start_game', { room: roomName });
        waitingPlayer.emit('assign_role', { role: 'x' });
        socket.emit('assign_role', { role: 'o' });
        waitingPlayer = null; // сбрасываем очередь
    }

    socket.on('user_pick', (data) => {
        console.log(`Ход от игрока ${data.player}: row=${data.row}, col=${data.col}`);
        if (socket.room) {
            io.to(socket.room).emit('game_update', { row: data.row, col: data.col, player: data.player });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Игрок отключился: ${socket.id}`);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});