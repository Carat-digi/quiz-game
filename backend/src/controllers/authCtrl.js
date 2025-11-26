const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const User = require("../models/user")

exports.register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const userExist = await User.findOne({ $or: [ { username }, { email } ] })
  if (userExist) {
    return res.status(400).json({ message: "Username or email already in use" })
  }

  const hash = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    passwordHash: hash
  })
  await user.save()
  res.status(201).json({ message: "User registered successfully" })
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required "})
  }

  const userInBase = await User.findOne({email})
  const passwordCorrect = userInBase === null
    ? false
    : await bcrypt.compare(password, userInBase.passwordHash)

  if(!(userInBase && passwordCorrect)) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const userForToken = {
    id: userInBase._id,
    username: userInBase.username,
    root: userInBase.root
  }

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })
  
  res.status(200).json({ token, username: userInBase.username, root: userInBase.root })
}
