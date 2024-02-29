const { User } = require("../../models/index");
const jwt = require("jsonwebtoken");
const { errorResponse, successResponse } = require("../../utils/response");
const CustomError = require("../../utils/customError");
const { decodeToken } = require("../../utils/jwt")

const authenticate = async (req, res, next) => {
  try {
    // Lấy accessToken từ header
    const authorizationStr = req.headers.authorization;
    if (!authorizationStr || !authorizationStr.startsWith("Bearer")) {
      throw new CustomError("Unauthorized", 401)
    }

    const token = authorizationStr?.split(" ")[1];
    if (!token) {
        throw new CustomError("Unauthorized", 401)
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.userId) {
        throw new CustomError("Unauthorized", 401)
    }

    // Kiểm tra có tồn tại user với id đã decode không
    const checkExist = await User.findByPk(decoded.userId);
    if (!checkExist) {
        throw new CustomError("Unauthorized", 401);
    }
    //Lưu id user vào req
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return errorResponse(res, e.status, e.message)
  }
};

module.exports = authenticate;
