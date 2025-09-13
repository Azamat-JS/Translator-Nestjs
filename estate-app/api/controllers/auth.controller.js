import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma';


export const  register = async(req, res) => {
   const {username, email, password} = req.body;
   
   const hashedPassword = await bcrypt.hash(password, 10);
   console.log(hashedPassword);
   const newUser = await prisma.user.create({
      data: {
         username,
         email,
         password
      }
   })
}
export const login = (req, res) => {

}
export const logout = (req, res) => {

}
