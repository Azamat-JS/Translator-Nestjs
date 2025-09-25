import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    imageUrl: {type: String, required: true},
    cartItems: {type: Object, default: {}},
}, {minimize: false, timestamps: true});

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;