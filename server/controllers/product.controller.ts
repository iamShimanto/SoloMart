import { RequestHandler } from "express";
import { responseHandler } from "../utils/responseHandler";
import Product from "../models/product.model";
import { redis } from "../config/redis";
import cloudinary from "../config/cloudinary";

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
    if (!products.length)
      return responseHandler.error(res, 404, "No product found");

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

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !price || !category)
      return responseHandler.error(res, 400, "Required all field");

    let cloudinayResponse = null;

    if (image) {
      cloudinayResponse = await cloudinary.uploader.upload(image, {
        folder: "Products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinayResponse?.secure_url ? cloudinayResponse?.secure_url : "",
      category,
    });
    responseHandler.success(
      res,
      201,
      "Products creaeted Successfully",
      product
    );
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};
