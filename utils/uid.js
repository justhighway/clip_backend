const { v4: uuidv4 } = require("uuid");

const generateUid = () => {
  return uuidv4().replace(/-/g, "").slice(0, 16); // 16자리 문자열로 자름
};

module.exports = generateUid;
