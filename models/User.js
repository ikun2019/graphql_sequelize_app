const { DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    }
  },
});
// JWT sign
User.prototype.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
}
// Compare Password
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;