import { Router } from "express";
import {
  quickGenerateController,
  compareFoodsController,
  generatePlanController,
} from "../controllers/foodController.js";

const router = Router();

router.post("/quick", quickGenerateController);
router.post("/compare", compareFoodsController);
router.post("/plan", generatePlanController);

export default router;


