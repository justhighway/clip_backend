const verifyToken = require("../utils/jwt");
const db = require("../db/db");

const getUserItems = async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const { uid } = verifyToken(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET
    );

    // 해당 uid로 업로드한 아이템이 있는지 확인
    const [userItems] = await db.execute(
      "SELECT ITEM_SEQ, ITEM_CATEGORY_SEQ, ITEM_UPLOADER_UUID, ITEM_NAME, ITEM_PRICE, ITEM_CONDITION, ITEM_DESCRIPTION, ITEM_PICTURES, ITEM_STATUS FROM ITEMS WHERE ITEM_UPLOADER_UUID = ?",
      [uid]
    );

    // 업로드한 아이템이 있는 경우에만 해당 아이템들을 반환
    if (userItems.length > 0) {
      res.status(200).json(userItems);
    } else {
      res.status(200).json([]); // 빈 배열 반환
    }
  } catch (error) {
    console.error("아이템 조회 중 에러가 발생했습니다: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addUserItem = async (req, res) => {
  try {
    // 클라이언트에서 전송된 데이터 추출
    const {
      ITEM_CATEGORY,
      ITEM_NAME,
      ITEM_PRICE,
      ITEM_CONDITION,
      ITEM_DESCRIPTION,
    } = req.body;

    // ITEM_CATEGORY에 해당하는 ITEM_CATEGORY_SEQ를 가져오기 위한 쿼리 실행
    const [categoryRow] = await db.execute(
      "SELECT ITEM_CATEGORY_SEQ FROM ITEM_CATEGORIES WHERE ITEM_CATEGORY = ?",
      [ITEM_CATEGORY]
    );

    // ITEM_CATEGORY가 존재하지 않으면 에러 처리
    if (categoryRow.length === 0) {
      return res.status(400).json({ message: "Invalid ITEM_CATEGORY" });
    }

    // ITEM_CATEGORY에 해당하는 ITEM_CATEGORY_SEQ 추출
    const ITEM_CATEGORY_SEQ = categoryRow[0].ITEM_CATEGORY_SEQ;

    // 현재 로그인된 사용자의 uid 가져오기
    const accessToken = req.headers.authorization.split(" ")[1];
    const { uid } = verifyToken(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET
    );

    // ITEMS 테이블에 물건 데이터 추가
    const [result] = await db.execute(
      "INSERT INTO ITEMS (ITEM_CATEGORY_SEQ, ITEM_UPLOADER_UUID, ITEM_NAME, ITEM_PRICE, ITEM_CONDITION, ITEM_DESCRIPTION, ITEM_STATUS) VALUES (?, ?, ?, ?, ?, ?, 'before')",
      [
        ITEM_CATEGORY_SEQ,
        uid,
        ITEM_NAME,
        ITEM_PRICE,
        ITEM_CONDITION,
        ITEM_DESCRIPTION,
      ]
    );

    // 새로 추가된 물건의 ITEM_SEQ 반환
    const ITEM_SEQ = result.insertId;

    res.status(200).json({ ITEM_SEQ });
  } catch (error) {
    console.error("물건 추가 중 에러가 발생했습니다: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUserItems, addUserItem };
