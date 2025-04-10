const User = require("../models/User")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")

const jwtSecret = process.env.JWT_SECRET

// Generate user token
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: "7d",
    })
}

// Register user and sign in
const register = async (req, res) => {

    const { name, email, password } = req.body

    // check if user exist
    const user = await User.findOne({ email })

    if (user) {
        res.status(422).json({ errors: ["Por favor, utilize outro e-mail."] })
        return
    }

    // Generate password hash
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const newUser = await User.create({
        name,
        email,
        password: passwordHash
    })

    //If user was created successfully, return the token
    if (!newUser) {
        res.status(422).json({ errors: ["Houve um erro, por favor tente mais tarde."] })
        return
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id)
    })

}

//Sign use in
const login = async (req, res) => {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    // Check if user exist
    if (!user) {
        res.status(404).json({ errors: ["Usuário não encontrado."] })
        return
    }

    // checl if password matches
    if (!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({ errors: ["Senha inválida"] })
        return
    }

    //Return user with token
    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id)
    })
}

// get current logged in user
const getCurrentUser = async (req, res) => {
    const user = req.user

    res.status(200).json(user)
}

// update an user
const update = async (req, res) => {
    const { name, password, bio } = req.body;

    let profileImage = null;

    if (req.file) {
        profileImage = req.file.filename;
    }

    const reqUser = req.user;

    try {
        const user = await User.findById(reqUser._id).select("-password");

        if (name) {
            user.name = name;
        }

        if (password) {
            // Generate password hash
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            user.password = passwordHash;
        }

        if (profileImage) {
            user.profileImage = profileImage;
        }

        if (bio) {
            user.bio = bio;
        }

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ errors: ["Erro ao atualizar o usuário."] });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    // Valida se o ID é um ObjectId válido do MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
       
    }

    try {
        const user = await User.findById(id).select("-password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({ errors: ["Usuário não encontrado."] });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ errors: ["Erro ao buscar usuário."] });
    }
};



module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById
}