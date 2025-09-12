import express from 'express'

const app = express();

app.use('/api/test', (req, res) => {
    res.json({message: "salom"})
})
app.listen(8800, () => {
    console.log('Server is running')
})