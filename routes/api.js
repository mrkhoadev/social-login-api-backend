var express = require('express');
const authController = require('../controllers/api/v1/auth.controller');
const authMiddleware = require('../middlewares/api/auth.middleware');
var router = express.Router();
const passport = require("passport");
const userController = require('../controllers/api/v1/user.controller');

/* GET home page. */
router.get('/v1/auth/google', authController.handleLoginGoogle);
router.get('/v1/auth/google/callback', 
passport.authenticate(
    "google", 
    {
        session: false,
    }
), authController.googleCallback);

router.get('/v1/auth/github', authController.handleLoginGithub);
router.get('/v1/auth/github/callback',passport.authenticate(
    "github", 
    {
        session: false,
    }
), authController.githubCallback);
router.get("/v1/auth/profile", authMiddleware, authController.profile);

router.get("/v1/users/user-list", authMiddleware, userController.userList);
router.get("/v1/users/:id", authMiddleware, userController.userDetail);
router.patch("/v1/users/edit", authMiddleware, userController.userEdit);
router.delete("/v1/users/delete/:id", authMiddleware, userController.userDelete);
router.delete("/v1/users/deleteSelected", authMiddleware, userController.userDeleteSelected);

module.exports = router;
