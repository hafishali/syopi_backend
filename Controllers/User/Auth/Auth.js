const User = require('../../../Models/User/UserModel');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../../../utils/tokenUtils');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, phone, password, referredBy } = req.body;
  
    try {
      // Validate referredBy (optional)
      let referrer = null;
      if (referredBy) {
        referrer = await User.findOne({ referralCode: referredBy });
        if (!referrer) {
          return res.status(400).json({ message: 'Invalid referral code' });
        }
      }
  
      // Create new user
      const newUser = new User({ name, email, phone, password, referredBy });
      await newUser.save();
  
      res.status(201).json({
        message: 'User registered successfully',
        referralCode: newUser.referralCode,
      });
  
      if (referrer) {
        console.log(
          `Referral successful! Referrer: ${referrer.email || referrer.phone || 'Unknown contact info'}`
        );      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  

// Login User
exports.loginUser = async (req, res) => {
    const { emailOrPhone, password } = req.body;
  
    try {
      const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const payload = { id: user._id, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
  
      res.status(200).json({
        message: 'User logged in successfully',
        user: { name: user.name, email: user.email, phone: user.phone, role: user.role },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  