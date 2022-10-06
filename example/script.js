// jika memakai axios
var url = 'url'
var data = {
    jid: 'nomor tujuan',
    text: 'text virtext'
}

axios.post(url, data)
    .then(({ data }) => {
        // kondisi dimana data terkirim
        console.log(data) // hapus jika tidak perlu memakai console.log, sesuaikan aja
    })
    .catch(e => {
        // kondisi dimana data gagal terkirim
        console.log('gagal:(', String(e)) // hapus jika tidak perlu memakai console.log, sesuaikan aja
    })
