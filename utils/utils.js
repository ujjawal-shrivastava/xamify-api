const bcrypt = require("bcrypt");

const genPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
};

const dateFormat = async(date) => {
    date = new Date(date);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();

    if (dt < 10) {
        dt = "0" + dt;
    }
    if (month < 10) {
        month = "0" + month;
    }

    return `${year}-${month}-${dt}`;
};

module.exports = { genPassword, dateFormat };