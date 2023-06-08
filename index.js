const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const port = 3000
const {Message} = require('./models')
const db = require('./models')

app.get('/messages', (req, res) => {
    const recipient = req.query.recipient
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
        created_user = await Message.create(msg)
        res.status(200).json({ message: 'Message posted' })
    } catch (error) {
        console.error('Error posting user:', error)
        res.status(500).json({ error: 'Failed to post user' })
    }
})

db.sequelize.sync().then((req) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
})