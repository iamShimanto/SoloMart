import { Router } from "express";
import * as auth from "../controllers/auth.controller";

const router = Router();

router.post("/signup", auth.signup);
router.post("/signin", auth.signin);
router.get("/signout", auth.signout);
router.post("/refresh-token", auth.refreshToken)

export default router;
