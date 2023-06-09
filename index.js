const express = require('express')
const cors = require('cors')
const uniq = require('lodash/uniq')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

app.use(cors())
app.use(express.json())
const port = 3000
const {Message} = require('./models')
const db = require('./models')

app.get('/messages', (req, res) => {
    const recipient = req.query.recipient
    if (!recipient) {
        Message.findAll()
        .then((messages)=>{
            const recipients = messages.map(m => m.to)
            const uniqueRecipients = uniq(recipients)
            res.status(200).json(uniqueRecipients)
        })
        .catch((err)=>{
            console.log(err)
        })
        return
    }
    Message.findAll({where: {to: recipient}})
        .then((messages)=>{
            res.status(200).json(messages)
        })
        .catch((err)=>{
            console.log(err)
        })
})

app.post('/messages',  async(req, res, next) => { 
    try {
        const msg = {
            from : req.body.from,
            to : req.body.to,
            title : req.body.title,
            messageBody : req.body.messageBody
        }
        const createdMessage = await Message.create(msg)
        io.to(req.body.to).emit('receiveMessage', createdMessage)
        res.status(200).json({ message: 'Message posted' })
    } catch (error) {
        console.error('Error posting user:', error)
        res.status(500).json({ error: 'Failed to post user' })
    }
})

io.on('connection',  (socket) => {
    console.log('A user connected')
  
    socket.on('joinRoom', (recipient) => {
        console.log('joined room:', recipient)
      socket.join(recipient)
    })
  
    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
})

db.sequelize.sync().then((req) => {
    http.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
})