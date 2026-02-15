import 'dotenv/config';

const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ success: false, message: "Access Denied" });
  }
  next();
};

export default adminAuth;