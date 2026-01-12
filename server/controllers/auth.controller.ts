import { RequestHandler } from "express";
import { responseHandler } from "../utils/responseHandler";
import { isValidEmail } from "../utils/validator";
import User from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from "../utils/tokens";
import { setCookies } from "../utils/helper";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { redis } from "../config/redis";

export const signup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return responseHandler.error(
        res,
        400,
        "Name, email and password are required"
      );
    }
    if (!isValidEmail(email)) {
      return responseHandler.error(res, 400, "Invalid email format");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return responseHandler.error(res, 409, "Email already in use");
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    await storeRefreshToken(newUser._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    return responseHandler.success(res, 201, "User registered successfully", {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    return responseHandler.error(res, 500, "Internal Server Error", error);
  }
};

export const signin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return responseHandler.error(res, 400, "Email is required");
    if (!isValidEmail(email))
      return responseHandler.error(res, 400, "Enter a valid Email");
    if (!password)
      return responseHandler.error(res, 400, "Password is required");

    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 400, "Invalid request");
    }

    const checkPassword = await user.comparePassword(password);
    if (!checkPassword)
      return responseHandler.error(res, 400, "Invalid request");

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    responseHandler.success(res, 200, "Login Successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const signout: RequestHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };
      if (decoded?.userId) {
        await redis.del(`refresh_token:${decoded?.userId}`);
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    responseHandler.success(res, 200, "Logout Successfully");
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return responseHandler.error(res, 400, "No refresh token provided");

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
    };
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return responseHandler.error(res, 400, "Invalid refresh token");
    }

    const accessToken = generateAccessToken(decoded?.userId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    responseHandler.success(res, 200, "Token refreshed successfully");
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};
