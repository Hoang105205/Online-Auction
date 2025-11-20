const CORS_OPTIONS = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // Cho phép nhận/gửi cookies
  optionsSuccessStatus: 200,
};
export default CORS_OPTIONS;
