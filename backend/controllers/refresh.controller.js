const jwt = require("jsonwebtoken");

const refresh = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token not found",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      accessToken,
    });
  } catch (err) {
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
};

module.exports = { refresh };