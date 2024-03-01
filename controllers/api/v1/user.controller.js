const { User, Provider, sequelize } = require("../../../models/index");
const { Op } = require("sequelize");
const { successResponse, errorResponse } = require("../../../utils/response");
const CustomError = require("../../../utils/customError");
module.exports = {
    userList: async (req, res, next) => {
        const userId = req.userId;
        try {
            if (!userId) {
                throw new CustomError("User Not Found", 401);
            }
            const userList = await User.findAll({
                where: {
                    [Op.not]: { id: userId },
                },
                order: [["id", "asc"], ["created_at", "asc"]]
            });
            if (!userList) {
                throw new CustomError("User findAll failed", 500)
            }
            return successResponse(res, 200, "Success", userList)
        } catch (error) {
            return errorResponse(res, error.status, error.message)   
        }
    },
    userDetail: async (req, res, next) => {
        const userId = req.params.id;
        try {
            if (!userId) {
                throw new CustomError("User Not Found", 401);
            }
            const user = await User.findByPk(userId, {
                include: {
                    model: Provider,
                    as: "providers"
                },
            });
            if (!user) {
                throw new CustomError("User Not Found", 401)
            }
            return successResponse(res, 200, "Success", {
                id: user.id,
                email: user.email,
                name: user.name,
                thumbnail: user.thumbnail,
                providers: user.providers
            });
        } catch (error) {
            return errorResponse(res, error.status, error.message)   
        }
    },
    userEdit: async (req, res, next) => {
        const { name, id } = req.body;console.log(req.body);
        try {
            if (!name || !id) {
                throw new CustomError("Bad Request", 400);
            }
            const user = await User.update({
                name,
                updated_at: new Date()
            }, {
                where: { id }
            });
            if (!user) {
                throw new CustomError("User Not Found", 401)
            }
            return successResponse(res, 200, "Success", {
                id: user,
            });
        } catch (error) {
            return errorResponse(res, error.status, error.message)   
        }
    },
    userDelete: async (req, res, next) => {
        const userId = req.params.id;
        try {
            if (!userId) {
                throw new CustomError("User Not Found", 401);
            }
            await sequelize.transaction(async (t) => {
                // Xóa người dùng
                const user = await User.destroy({
                    where: {
                        id: userId
                    },
                    transaction: t
                });
    
                if (!user) {
                    throw new CustomError("User Not Found", 404)
                }
                return successResponse(res, 200, "Success", {
                    id: userId,
                });
            });

            
        } catch (error) {
            return errorResponse(res, error.status, error.message)   
        }
    },
    userDeleteSelected: async (req, res, next) => {
        const userIds = req.body || []
        try {
            if (!userIds === 0) {
                throw new CustomError("User Not Found", 401);
            }
            await sequelize.transaction(async (t) => {
                // Xóa người dùng
                const user = await User.destroy({
                    where: {
                        id: userIds
                    },
                    transaction: t
                });
    
                if (!user) {
                    throw new CustomError("User Not Found", 404)
                }
                return successResponse(res, 200, "Success", userIds);
            });
        } catch (error) {
            return errorResponse(res, error.status, error.message)   
        }
    },
}