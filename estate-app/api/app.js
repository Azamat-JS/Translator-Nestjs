import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import postRouter from './routes/post.route.js';
import testRouter from './routes/test.route.js';
import userRouter from './routes/user.route.js';
import chatRouter from './routes/user.route.js';
import messageRouter from './routes/user.route.js';
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser())
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/test', testRouter);
app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/message', messageRouter);
app.listen(8800, () => {
    console.log('Server is running')
})