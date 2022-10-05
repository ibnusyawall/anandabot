/*var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST)
var el;
var elstatus;
*/

var socket = io()

/*ws.onmessage = (event) => {
    el = document.getElementById('time')
    el.innerHTML = 'Server time: ' + event.data
}
*/

socket.on('qr:data', qr => {
    console.log(qr)
    $('#output').html('').qrcode(qr)
})

socket.on('login:success', ({ msg }) => {
    socket.emit('test:oke', { data: 'oke bang' })
    $('#output').html('')
    elstatus = document.getElementById('status')
    elstatus.innerHTML = 'Sukses login!'
})
