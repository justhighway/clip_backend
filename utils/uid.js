const { v4: uuidv4 } = require("uuid");

const generateUid = () => {
  return uuidv4();
};

module.exports = generateUid;
