process.on('uncaughtException', console.error)

const qrcode = require('qrcode-terminal')

var { HOME } = process.env

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
    } = require(HOME + '/fun/bot/dev/wa-gate2//Baileys/lib')

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

    client.calls = client.calls ? client.calls : {}

    client.sendTemplateHydrated = function(from, { text, buttons = [], mentions = [], footer = ''} = {}) {
       var template = {
           hydratedContentText: text,
           hydratedFooterText: `${footer || 'WhatsApp Bot'} | aexbot-md`,
           hydratedButtons: buttons
       }

       var hydratedTemplate = {
           viewOnceMessage: {
               message: {
                   templateMessage: {
                       hydratedTemplate: template
                   },
               },
               mentionedJid: mentions
           }
       }
       client.relayMessage(from, hydratedTemplate, {})
    }

    // calls auto reject
    conn.on('call', json => {
        var { id, from, status } = json[0]

        client.calls[from] ? client.calls[from] : (client.calls[from] = 0)

        var date = new Date()
        date = date.toLocaleString("id", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })

        if (status === 'offer') {
            client.rejectCall(id, from).then(() => {
                client.calls[from]++

                client.sendTemplateHydrated(from, {
                    text: `I'm busy, don't talk yet! [${client.calls[from]}/2]`,
                    footer: 'auto reject'
                })

                if (client.calls[from] >= 3) {
                    client.updateBlockStatus(from, 'block')
                        .then(() => {
                            setTimeout(() => {
                                client.calls[from] = 0;
                                client.updateBlockStatus(from, 'unblock')
                                client.sendTemplateHydrated(from, {
                                    text: 'Hello there, can I help you?',
                                    footer: 'auto reject'
                                })
                            }, 3 * 60 * 1000) // unblock in 3 minutes
                        })
                }
            })
        }
    })

    conn.on('connection.update', ({
        qr,
        connection,
        lastDisconnect,
        isNewLogin
    }) => {
        if (qr) {
            console.log('[*] QR DATA URI:', qr)
            // qrcode.generate(qr)
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
