const { Strategy } = require("passport-github2");

const GithubPassport = new Strategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: `${process.env.HOSTING}/auth/github/callback`,
    passReqToCallback: true,
    scope: ["profile", "user:email"],
  },
  async (request, accessToken, refreshToken, profile, done) => {
    const user = {
      email: profile.emails[0].value,
      name: profile?.displayName,
      thumbnail: profile?._json?.avatar_url,
      provider: profile?.provider
    };

    return done(null, user);
  }
);

module.exports = GithubPassport;
