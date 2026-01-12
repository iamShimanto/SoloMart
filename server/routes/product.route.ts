import { Router } from "express";
import * as product from "../controllers/product.controller";
import { adminRoute, protectedRoute } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protectedRoute, adminRoute, product.getAllProducts);
router.get("/featured", product.getFeaturedProducts)

export default router;
