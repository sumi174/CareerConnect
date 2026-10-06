const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["job_seeker", "employer"],
            default: "job_seeker"
        },
        phone: {
    type: String,
    trim: true
},

skills: {
    type: String,
    trim: true
},

bio: {
    type: String,
    trim: true
},

company: {
    type: String,
    trim: true
}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);