import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import postRouter from './routes/post.route.js';
const app = express();


app.use(express.json());
app.use(cookieParser())
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.listen(8800, () => {
    console.log('Server is running')
})