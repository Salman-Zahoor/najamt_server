const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "7287sjhjh8hjshjhjshh76@@@#452454525454fgfDF##$#@#45443453fdfdrE#434SwwwW$@#@#$#@%@%$%@$@%@^&hgHG77gy767yty";


function verifyToken(req, res, next) {
  const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

  if (!token) {
    return res.status(401).json({ status: "error", message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Replace 'your-secret-key' with your actual secret key
    req.user = decoded; // Store the decoded user information in the request object
    next(); // Continue with the request
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
}

module.exports = verifyToken;
