const {Model, DataTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sql", {logging: false});
const bcrypt = require('bcrypt');


class User extends Model {};

User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
}, {sequelize: sequelize})

User.beforeCreate(async function(user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
})

/* User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
} */

module.exports = {
    User,
    sequelize
}