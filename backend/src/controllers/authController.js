const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/* =====================================================
   Nodemailer Transporter Setup
===================================================== */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =====================================================
   1. SIGNUP
===================================================== */
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('❌ SIGNUP ERROR:', error.message);
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    });
  }
};

/* =====================================================
   2. LOGIN
===================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    /* -------- 2FA Enabled -------- */
    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otpCode = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      try {
        await transporter.sendMail({
          to: user.email,
          from: process.env.EMAIL_USER,
          subject: '🛡️ Login Verification Code',
          html: `<h1>Your OTP is: ${otp}</h1>`,
        });

        return res.status(200).json({
          requires2FA: true,
          message: 'OTP sent to email',
        });
      } catch (mailError) {
        console.error('📧 Mail Error:', mailError.message);
        return res.status(500).json({
          message: 'Error sending OTP email',
        });
      }
    }

    /* -------- Normal Login -------- */
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret_key_fallback',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    });
  }
};

/* =====================================================
   3. VERIFY OTP
===================================================== */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: {
        email,
        otpCode: otp,
        otpExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret_key_fallback',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
    });
  }
};

/* =====================================================
   4. TOGGLE 2FA
===================================================== */
exports.toggle2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    user.twoFactorEnabled = req.body.twoFactorEnabled;
    await user.save();

    return res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
    });
  }
};

/* =====================================================
   5. FORGOT PASSWORD
===================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({
        message: 'Not found',
      });
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await transporter.sendMail({
      to: user.email,
      subject: 'Reset Password',
      html: `<a href="http://localhost:5173/reset-password/${token}">Reset Password</a>`,
    });

    return res.status(200).json({
      message: 'Reset link sent',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
    });
  }
};

/* =====================================================
   6. RESET PASSWORD
===================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Token expired or invalid',
      });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
    });
  }
};

/* =====================================================
   7. UPDATE PROFILE
===================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const { username, gender, dob, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (username) user.username = username;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    if (newPassword && newPassword.trim() !== '') {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const userData = user.get({ plain: true });
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userData,
    });
  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error.message);
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    });
  }
};

/* =====================================================
   8. DELETE PROFILE
===================================================== */
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Delete profile picture if exists
    if (user.profilePic) {
      const filePath = path.join(__dirname, '../../', user.profilePic);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {}
      }
    }

    await user.destroy();

    return res.status(200).json({
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error: error.message,
    });
  }
};