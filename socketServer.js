const MAX_ROOM_SIZE = 2;
const ROOM_ID_LENGTH = 4;
let rooms = [];

const SocketServer = ((socket) => {

    socket.on("join_room", (data) => {
        handleRoomJoin(socket, data);
    });

    socket.on("sendUpdatedState", (updatedState, room_id) => {
        handleStateUpdate(socket, updatedState, room_id);
    });

    socket.on("game_over", (room_id) => {
        rooms = rooms.filter((room) => room.room_id != room_id);
    });

    socket.on("disconnect", () => {
        handleDisconnect(socket);
    });

    socket.on("confirmOnlineState", (storedId, room_id) => {
        handleOnlineConfirmation(storedId, room_id);
    });
});

function handleRoomJoin(socket, { room_id, storedId }) {
    if (!isValidRoomId(room_id)) {
        sendError(socket, "Invalid room ID.");
        return;
    }

    socket.join(room_id);
    let room = findRoomById(room_id);
    
    if (!room) {
        room = createNewRoom(room_id, storedId, socket.id);
        initializePlayer(socket, room.playerOneState);
        return;
    }

    processExistingRoom(socket, room, storedId);
}

function isValidRoomId(roomId) {
    return roomId && roomId.length === ROOM_ID_LENGTH;
}

function sendError(socket, message) {
    io.to(socket.id).emit("error", message);
}

function findRoomById(roomId) {
    return rooms.find(room => room.room_id === roomId);
}

function createNewRoom(roomId, storedId, socketId) {
    const playerOneState = initializeDeck(); 
    const newRoom = {
        room_id: roomId,
        players: [{ storedId, socketId, player: "one" }],
        playerOneState
    };
    rooms.push(newRoom);
    return newRoom;
}

function initializePlayer(socket, playerState) {
    io.to(socket.id).emit("dispatch", {
        type: "INITIALIZE_DECK",
        payload: playerState
    });
}

function processExistingRoom(socket, room, storedId) {
    const currentPlayers = room.players;
    
    if (currentPlayers.length === MAX_ROOM_SIZE) {
        handleRoomFull(socket, storedId, room);
    } else {
        addPlayerToRoom(socket, storedId, room);
    }
}

function handleRoomFull(socket, storedId, room) {
    const isPlayerInRoom = room.players.some(player => player.storedId === storedId);
    
    if (isPlayerInRoom) {
        reinitializePlayer(socket, storedId, room);
    } else {
        sendError(socket, "Room is full. Please join a different room.");
    }
}

function addPlayerToRoom(socket, storedId, room) {
    room.players.push({ storedId, socketId: socket.id, player: "two" });
    io.to(socket.id).emit("dispatch", {
        type: "INITIALIZE_DECK",
        payload: reverseState(room.playerOneState),
    });
    socket.broadcast.to(room.room_id).emit("confirmOnlineState");
}

function reinitializePlayer(socket, storedId, room) {
    const currentPlayer = room.players.find(player => player.storedId === storedId);
    currentPlayer.socketId = socket.id; 
    const playerState = currentPlayer.player === "one" ? room.playerOneState : reverseState(room.playerOneState);
    io.to(socket.id).emit("dispatch", {
        type: "INITIALIZE_DECK",
        payload: playerState
    });
}

function handleStateUpdate(socket, updatedState, room_id) {
    const room = findRoomById(room_id);
    if (!room) return;

    const playerOneState = updatedState.player === "one" ? updatedState : reverseState(updatedState);
    room.playerOneState = playerOneState; 

    const opponent = room.players.find(player => player.socketId !== socket.id);
    if (opponent) {
        socket.to(opponent.socketId).emit("dispatch", {
            type: "UPDATE_STATE",
            payload: reverseState(playerOneState) 
        });
    }
}

function handleDisconnect(socket) {
    const room = rooms.find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;

    const opponent = room.players.find(player => player.socketId !== socket.id);
    if (opponent) {
        io.to(opponent.socketId).emit("opponentOnlineStateChanged", false);
    }
}

function handleOnlineConfirmation(storedId, room_id) {
    const room = findRoomById(room_id);
    if (!room) return;

    const opponent = room.players.find(player => player.storedId !== storedId);
    if (opponent) {
        io.to(opponent.socketId).emit("opponentOnlineStateChanged", true);
    }
}

module.exports = SocketServer