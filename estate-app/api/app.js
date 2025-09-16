import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import postRouter from './routes/post.route.js';
import testRouter from './routes/test.route.js';
const app = express();

app.use(cors({origin:"*"}))
app.use(express.json());
app.use(cookieParser())
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/test', postRouter);
app.listen(8800, () => {
    console.log('Server is running')
})