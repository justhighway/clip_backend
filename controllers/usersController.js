// backend/controllers/usersController.js:

const bcrypt = require("bcrypt");
const db = require("../db/db");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const generateUid = require("../utils/uid");
const checkDuplicateEmail = require("../utils/checkDuplicateEmail");
require("dotenv").config();

const signUp = async (req, res) => {
  try {
    const { userEmail, userPassword, userName, userPhone, userProfilePicture } =
      req.body;

    // email, pwd, name 하나라도 없으면 400 error
    if (!userEmail || !userPassword || !userName) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // 중복된 이메일인지 확인 - 중복되면 400 error
    const isDuplicateEmail = await checkDuplicateEmail(userEmail);
    if (isDuplicateEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    // uuid 생성
    const uid = generateUid();

    // USERS 테이블에 새로운 사용자 추가
    // userPhone, userProfilePicture가 없으면 null로 처리
    await db.execute(
      "INSERT INTO USERS (USER_UUID, USER_EMAIL, USER_PASSWORD, USER_NAME, USER_PHONE, USER_PICTURE) VALUES (?, ?, ?, ?, ?, ?)",
      [
        uid,
        userEmail,
        hashedPassword,
        userName,
        userPhone || null,
        userProfilePicture || null,
      ]
    );

    // 성공 시 201 created 응답 반환
    console.log("유저 생성 완료");
    res.status(201).json({ message: "유저 생성 완료" });
  } catch (error) {
    console.error("회원가입 중 에러가 발생했습니다: ", error);
    res.status(500).json({ message: "서버 처리 오류" });
  }
};

const signIn = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // rows: [ RowDataPacket { USER_UUID: '...', USER_EMAIL: '...', USER_PASSWORD: '...' } ]
    const [rows] = await db.execute(
      // 이메일로 사용자 찾기
      "SELECT * FROM USERS WHERE USER_EMAIL = ?",
      [userEmail]
    );

    // 사용자가 없으면 404 에러
    if (rows.length === 0) {
      console.log("유저를 찾을 수 없습니다");
      return res.status(404).json({ message: "User not found" });
    }

    // rows[0]: RowDataPacket { USER_UUID: '...', USER_EMAIL: '...', USER_PASSWORD: '...' }
    // user: { USER_UUID: '...', USER_EMAIL: '...', USER_PASSWORD: '...' }
    // rows[0]은 배열이므로 rows[0]으로 user를 가져옴
    // rows[0]은 DB에서 가져온 유저의 정보
    const user = rows[0];

    // 비밀번호 일치 여부 확인
    // userPassword와 user.USER_PASSWORD 비교 - user.: DB에서 가져온 비밀번호
    const passwordMatch = await bcrypt.compare(
      userPassword,
      user.USER_PASSWORD
    );

    // 비밀번호 불일치 시 401 에러
    if (!passwordMatch) {
      console.log("비밀번호가 일치하지 않습니다");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 유저 정보를 기반으로 access token과 refresh token 생성
    const accessToken = generateAccessToken(user.USER_UUID);
    const refreshToken = generateRefreshToken(user.USER_UUID);

    // access token과 refresh token을 클라이언트에게 반환
    // user.USER_UUID: DB에서 가져온 유저의 UUID
    res.status(200).json({ accessToken, refreshToken, uid: user.USER_UUID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const setUserProfile = async (req, res) => {
  try {
    // 클라이언트에서 서버로 요청을 보낼 때, 요청 헤더에 accessToken을 담아 보냄
    // req.headers.authorization: "Bearer accessToken"
    // req.headers.authorization 값 예시: "Bearer eyJhbGciOi..."
    // req.headers.authorization.split(" "): ["Bearer", "accessToken"]
    const accessToken = req.headers.authorization.split(" ")[1];

    // accessToken을 verify하여 유저의 UUID를 가져옴
    const { uid } = verifyToken(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET
    );

    // uid로 사용자를 찾아 사용자 이름을 업데이트
    const { userName } = req.body;
    await db.execute("UPDATE USERS SET USER_NAME = ? WHERE USER_UUID = ?", [
      userName,
      uid,
    ]);

    console.log("유저 프로필 업데이트 완료");
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("유저 프로필 업데이트 실패: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    //
    const { uid } = req.params;
    const [rows] = await db.execute("SELECT * FROM USERS WHERE USER_UUID = ?", [
      uid,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "user not found" });
    }

    const user = rows[0];
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { signUp, signIn, setUserProfile, getUserProfile };
