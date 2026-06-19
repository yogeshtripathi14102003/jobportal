import * as authService from "../service/employerAuth.service.js";
import catchAsync from "../../../utils/catchAsync.js";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "none",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const register = catchAsync(async (req, res) => {
  const { employer, accessToken, refreshToken } = await authService.registerEmployer(req.body);

  res.cookie("jobhaiRefreshToken", refreshToken, cookieOptions);
  res.status(201).json({
    success: true,
    message: "Registration successful. Your company is pending admin verification.",
    data: { employer, accessToken },
  });
});

const login = catchAsync(async (req, res) => {
  const { account, accountType, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password
  );

  res.cookie("jobhaiRefreshToken", refreshToken, cookieOptions);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { account, accountType, accessToken },
  });
});

const refresh = catchAsync(async (req, res) => {
  const incoming = req.cookies?.jobhaiRefreshToken || req.body?.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshTokens(incoming);

  res.cookie("jobhaiRefreshToken", refreshToken, cookieOptions);
  res.status(200).json({
    success: true,
    message: "Token refreshed",
    data: { accessToken },
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id, req.accountType);
  res.clearCookie("jobhaiRefreshToken", cookieOptions);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { account: req.user, accountType: req.accountType },
  });
});

export { register, login, refresh, logout, getMe };
