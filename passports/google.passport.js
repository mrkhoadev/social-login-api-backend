const GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config();

module.exports = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${process.env.HOSTING}/auth/google/callback`,
      scope: ["email", "profile"],
      passReqToCallback: true
    },
    function (request, accessToken, refreshToken, profile, done) {
      const user = {
        email: profile?.email,
        name: profile?.displayName,
        thumbnail: profile?._json?.picture,
        provider: profile?.provider
      };
      done(null, user);
    },
  );
