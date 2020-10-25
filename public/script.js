const videoGrid = document.getElementById('video-grid');
const socket = io('https://rebel-purring-toothbrush.glitch.me');
let peers = {};
let myId;
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (stream) => {
            addVideoStream(video, stream);
        });
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });
}).catch(() => {
    alert('לא תוכל להשתמש באפליקציה ללא נתינת הרשאות מתאימות');
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) {
        peers[userId].close();
    }
});

const addVideoStream = (video, stream) => {
    const div = document.createElement('div');
    const p = document.createElement('p');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    div.append(video);
    videoGrid.append(div);
}

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (stream) => {
        addVideoStream(video, stream, userId);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

myPeer.on('open', (id) => {
    myId = id;
    socket.emit('join-room', ROOM_ID, id);
});
