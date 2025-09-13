import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken'


export const  register = async(req, res) => {
   const {username, email, password} = req.body;
   try {   
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
         data: {
            username,
            email,
            password: hashedPassword,
         }
      });
      res.status(201).json({message: "User created successfully"});
   } catch (error) {
      res.status(500).json({message: 'Failed to create user!'})
   }
}
export const login = async(req, res) => {
const {username, password} = req.body;
try {
   const user = await prisma.user.findUnique({
      where: {username}
   }, );
   
   if(!user) return res.status(401).json({message: 'Invalid credentials!'});
   const isPasswordValid = await bcrypt.compare(password, user.password);
   
   if(!isPasswordValid) return res.status(401).json({message: 'Invalid credentials!'});
   const token = jwt.sign({
      id: user.id,
   }, process.env.JWT_SECRET_KEY)
const age = 1000 * 3600 * 24 * 7;
res.cookie('test2', 'myvalue2', {
   httpOnly: true,
   // secure: true,
   maxAge: age,
}).status(200).json({message: 'Login successful'})
} catch (error) {
   console.log(error);
   res.status(500).json({message: 'Failed to login!'})
}
}
export const logout = (req, res) => {

}
