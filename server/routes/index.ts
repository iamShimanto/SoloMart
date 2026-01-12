import { Router } from "express";
import auth from "./auth.route";
import product from "./product.route";

const router = Router();

router.get("/", (req, res) => {
  res.send("server is running");
});

router.use("/api/auth", auth);
router.use("/api/product", product);

router.use((req, res) => {
  res.status(404).send({ message: "Api endpoints not found" });
});

export default router;
