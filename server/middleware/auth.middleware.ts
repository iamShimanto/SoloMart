import { RequestHandler } from "express";
import { responseHandler } from "../utils/responseHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import User from "../models/user.model";

export const protectedRoute: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken)
      return responseHandler.error(
        res,
        400,
        "Unauthorized - No access token Provided"
      );

    const decoded = jwt.verify(
      accessToken,
      env.JWT_ACCESS_SECRET
    ) as JwtPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return responseHandler.error(res, 400, "User not found");

    req.user = user;

    next();
  } catch (error) {
    responseHandler.error(
      res,
      500,
      "Unauthorized - Invalid access token",
      error
    );
  }
};

export const adminRoute: RequestHandler = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    responseHandler.error(res, 403, "Unauthorized - admin only");
  }
};
