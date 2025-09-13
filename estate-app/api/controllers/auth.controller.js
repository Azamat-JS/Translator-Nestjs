import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js';


export const  register = async(req, res) => {
   const {username, email, password} = req.body;
   
   const hashedPassword = await bcrypt.hash(password, 10);
   console.log(hashedPassword);
   const newUser = await prisma.user.create({
      data: {
         username,
         email,
         password: hashedPassword,
      }
   });
   res.status(200).json(newUser)
}
export const login = (req, res) => {

}
export const logout = (req, res) => {

}
