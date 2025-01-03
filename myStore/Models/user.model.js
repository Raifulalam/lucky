const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: false, default: 'user' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    avtar: { type: String, default: 'default-avatar.png' },
    userinfo: [
        {
            name: { type: String, required: true, },
            email: { type: String, required: true, unique: true, lowercase: true },
            phone: { type: String, required: true, unique: true },
            address: { type: String, required: true },
        },

    ]

})
module.exports = mongoose.model('User', UserSchema);
