export class SocketManager {
    constructor(path) {
        this.path = path;
        this.SOCKETSTATUS = {
            CONNECTED:           'Connected',
            ALREADY_CONNECTED:   'Already_Connected'
        };
        this.nbrConnection = 0;
    }
    connect() {
        // Prevent reconnection on navigation
        if(this.socket === undefined)
        {
            let token = sessionStorage.getItem('token');
            let host = window.location.hostname;
            let socketHost = host === 'localhost' ? 'localhost:4043' : window.location.host;
            this.socket = new WebSocket(`wss://${socketHost}/${this.path}/?token=${token}`);
            this.setupSocketEvents();
            this.nbrConnection++;
            return this.SOCKETSTATUS.CONNECTED
        }else {
            this.nbrConnection++;
            return this.SOCKETSTATUS.ALREADY_CONNECTED
        }
    }

    disconnect()
    {
        this.nbrConnection--;
        if(this.nbrConnection == 0) {
            const code = 3008;
            const reasson = 'Unexpected';
            if(this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.close(code, reasson);
                this.socket = undefined;
            }
        }
    }

    setupSocketEvents() {
        this.socket.addEventListener('open', (event) => {
            this.onOpen(event);
        });

        this.socket.addEventListener('message', (event) => {
            this.onMessage(JSON.parse(event.data));
        });

        this.socket.addEventListener('close', (event) => {
            this.onClose(event);
        });

        this.socket.addEventListener('error', (event) => {
            this.onError(event);
        });
    }

    send(sendType, sendMessage) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: sendType,
                message: sendMessage
            }));
        } else {
            console.error('WebSocket connection not open. Unable to send message:', sendMessage);
        }
    }

    onOpen(event) {}
    onMessage(data) {}
    onClose(event) {}
    onError(event) {}
}