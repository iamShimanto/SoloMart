import { RequestHandler } from "express";
import { responseHandler } from "../utils/responseHandler";
import Product from "../models/product.model";
import { redis } from "../config/redis";

export const getAllProducts: RequestHandler = async (req, res) => {
  try {
    const products = await Product.find({});

    responseHandler.success(res, 200, "Product fetched", products);
  } catch (error) {
    return responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const getFeaturedProducts: RequestHandler = async (req, res) => {
  try {
    const cached = await redis.get("featured_products");
    if (cached) {
      const products = JSON.parse(cached);
      return responseHandler.success(
        res,
        200,
        "featured products fetched successfully",
        products
      );
    }

    const products = await Product.find({ isFeatured: true });
    if(!products.length) return responseHandler.error(res,404, "No product found")

    await redis.set(
      "featured_products",
      JSON.stringify(products),
      "EX",
      10 * 60
    );

    responseHandler.success(
      res,
      200,
      "featured products fetched successfully",
      products
    );
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};
