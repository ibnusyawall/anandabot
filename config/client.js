process.on('uncaughtException', console.error)

const qrcode = require('qrcode-terminal')

global.client;
global.conn;

async function start(session, gclient, gconn) {
    const {
        default: makeWASocket,
        DisconnectReason,
        makeCacheableSignalKeyStore,
        MessageRetryMap,
        BufferJSON,
        makeInMemoryStore,
        useMultiFileAuthState,
        proto,
        fetchLatestBaileysVersion,
        generateWAMessageFromContent
    } = require('../Baileys/lib')

    const P = require('pino')

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(session)


    const logger = P().child({
        level: 'silent',
        stream: 'store'
    })

    const store = makeInMemoryStore({
        logger
    })

    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const client = makeWASocket({
        logger,
        version,
        browser: ['aexbot-md', 'Safari', '1.0.0'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        }
    })

    const {
        ev: conn,
        ws
    } = client

    store.bind(conn)

    gclient = client
    gconn = conn

    conn.on('connection.update', ({
        qr,
        connection,
        lastDisconnect,
        isNewLogin
    }) => {
        if (qr) {
            console.log('[*] QR DATA URI:', qr)
            qrcode.generate(qr)
            conn.emit('qr:data', qr)
        }
        if (connection) {
            if (connection == 'close') {
                if (lastDisconnect?.error?.output.statusCode != DisconnectReason.loggedOut) {
                    start(session)
                } else {
                    console.log('[*] LOGOUT', connection)
                }
            }
            console.log('[*] CONNECTION STATUS:', connection)
        }

        if (isNewLogin) {
            console.log('[!] LOGIN SUCCESS, WAITING OPPENED CONNECTION ...')
        }
    })

    ws.on('CB:success', () => {
        console.log('[!] CONNECTED')
        conn.emit('login:success')
    })

    conn.on('creds.update', saveCreds)

    return new Promise(resolve => {
        resolve({
           client: client,
           conn: conn
        })
    })
}

module.exports = { start: start }
