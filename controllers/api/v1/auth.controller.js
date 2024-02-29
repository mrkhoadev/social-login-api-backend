const { User, Provider, sequelize } = require("../../../models/index");
const CustomError = require("../../../utils/customError");
const { errorResponse, successResponse } = require("../../../utils/response");
const { createAccessToken, createRefreshToken } = require("../../../utils/jwt");
const passport = require("passport");
const { Op } = require("sequelize");
const { ServerResponse } = require("http");

module.exports = {
    profile: async (req, res) => {
        const userId = req.userId;

        const user = await User.findByPk(userId, {
            include: {
                model: Provider,
                as: "providers"
            },
        });
        return successResponse(res, 200, "Success", {
            id: user.id,
            email: user.email,
            name: user.name,
            thumbnail: user.thumbnail,
            providers: user.providers
        });
    },
    handleLoginGoogle: (req, res, next) => {
        const emptyResponse = new ServerResponse(req);

        passport.authenticate(
            "google",
            {
              scope: ["email", "profile"],
            }
        )(req, emptyResponse);
        
        const url = emptyResponse.getHeader("location");

        return successResponse(res, 200, "Success", {
            result: {
                urlRedirect: url,
            }
        });
    },
    googleCallback: async (req, res, next) => {
        try {
            const data = req.user;
            if (!data) {
                throw new CustomError("Bad request", 400);
            };
            await sequelize.transaction(async (t) => {
                const [user, createUser] = await User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        name: data.name,
                        thumbnail: data.thumbnail
                    },
                    transaction: t
                });
                if (!user) {
                    throw new CustomError("User findOrCreate failed", 500)
                };

                const [provider, createProvider] = await Provider.findOrCreate({
                    where: { 
                        [Op.and]: [{ name: data.provider }, { user_id: user.id }],   
                    },
                    defaults: {
                        status: true,
                        name: data.provider,
                        user_id: user.id
                    },
                    transaction: t
                });
                if (!provider) {
                    throw new CustomError("Provider findOrCreate failed", 500)
                }
                if (!createProvider) {
                    const userUpdate = await Provider.update({
                        status: true,
                        updated_at: new Date()
                    },{
                        where: { 
                            [Op.and]: [
                                { name: data.provider }, 
                                { user_id: user.id },
                            ],   
                        },
                        transaction: t
                    });
                    if (!userUpdate) {
                        throw new CustomError("Provider update failed", 500)
                    }
                }
                const accessToken = createAccessToken({ userId: user.id });
                const refreshToken = createRefreshToken();
                return successResponse(res, 200, "Success", { accessToken, refreshToken });
            });
        } catch (error) {
            return errorResponse(res, error.status, error.message)
        }
    },
    handleLoginGithub: (req, res, next) => {
        const emptyResponse = new ServerResponse(req);

        passport.authenticate(
            "github",
            { scope: ["user:email"] },
        )(req, emptyResponse);
        
        const url = emptyResponse.getHeader("location");
        return successResponse(res, 200, "Success", {
            result: {
                urlRedirect: url,
            }
        });
    },
    githubCallback: async (req, res, next) => {
        try {
            const data = req.user;
            if (!data) {
                throw new CustomError("Bad request", 400);
            };
            await sequelize.transaction(async (t) => {
                const [user, createUser] = await User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        name: data.name,
                        thumbnail: data.thumbnail
                    },
                    transaction: t
                });
                if (!user) {
                    throw new CustomError("User findOrCreate failed", 500)
                };
                const [provider, createProvider] = await Provider.findOrCreate({
                    where: { 
                        [Op.and]: [{ name: data.provider }, { user_id: user.id }],   
                    },
                    defaults: {
                        status: true,
                        name: data.provider,
                        user_id: user.id
                    },
                    transaction: t
                });
                if (!provider) {
                    throw new CustomError("Provider findOrCreate failed", 500)
                }
                if (!createProvider) {
                    const userUpdate = await Provider.update({
                        status: true,
                        updated_at: new Date()
                    },{
                        where: { 
                            [Op.and]: [
                                { name: data.provider }, 
                                { user_id: user.id },
                            ],   
                        },
                        transaction: t
                    });
                    if (!userUpdate) {
                        throw new CustomError("Provider update failed", 500)
                    }
                }
                const accessToken = createAccessToken({ userId: user.id });
                const refreshToken = createRefreshToken();
                return successResponse(res, 200, "Success", { accessToken, refreshToken });
            });
        } catch (error) {
            return errorResponse(res, error.status, error.message)
        }
    },
}
