var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var cors = require('cors')
var SocketIo = require('socket.io')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var { start } = require('./config/client')

var app = express()
var PORT = process.env.PORT || 8000
var server = app.listen(PORT, listen)

// var ws = SocketIo(server)

global.client;
global.conn;

app.set('trust proxy', true)
app.set('json spaces', 2)

app.use(cors({ origin: '*' }))
app.use(logger('dev'))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(cookieParser())

// app.use(express.static(path.join(__dirname, 'public')))
// app.use('/', indexRouter)
// app.use('/users', usersRouter)

var owner = '6285156030634'
owner = owner + '@s.whatsapp.net'

start('nanda', global.client, global.conn).then(({ client, conn }) => {
    global.client = client;
    global.conn = conn
})

app.get('/', function(req, res, next) {
    res.status(200).json({
        status: true,
        user: global.client?.user
    })
})

app.get('/api/v1', function(req, res, next) {
    res.status(200).json({
        status: true,
        user: global.client?.user
    })
})

app.post('/api/v1/sendMessage', (req, res) => {
    var { jid, text } = req.body
    jid = jid + '@s.whatsapp.net'

    // var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    global.client.sendMessage(jid, {
        text: String(text)
    }).then(msg => {
        if (msg) {
           return res.status(200).json(msg)
           global.sendMessage(owner, { text: `success send message\nip: ${req.ip}` })
        }
    }).catch(e => {
        if (e) {
            return res.status(401).json({ error: String(e) })
        }
    })
})

/*
start('nanda', global.client, global.conn).then(({ client, conn }) => {
    global.client = client;
    global.conn = conn
})*/

/*ws.on('connection', socket => {
    console.log('Client connected')
    socket.emit('test', { msg: 'Ws connected!' })

    global.conn.on('qr:data', qr => {
        socket.emit('qr:data', qr)
    })

    global.conn.on('login:success', () => {
        socket.emit('login:success')
    })

    socket.on('test:oke', data => console.log(data))
})*/

function listen() {
    console.log('🚀 Listen on port:', PORT)
}

module.exports = app
