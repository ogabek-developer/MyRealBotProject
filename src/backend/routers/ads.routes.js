import express from "express";
import adsController from "../controllers/ads.controller.js";
import { upload } from "../middlewares/multer.js";

export const adsRouter = express.Router();

adsRouter.get("/get/all", adsController.GET_ALL);
adsRouter.get("/get/:id", adsController.GET_BY_ID);
adsRouter.get("/get/client/by", adsController.GET_ALL_ADS_BYCLIENT);
adsRouter.get("/get/region/:region", adsController.GET_BY_REGION);

// ── CREATE: 1–3 ta rasm ──────────────────────────────────────────────────────
adsRouter.post(
  "/create",
  upload.array("goods_picture", 3),   // ← single → array
  adsController.CREATE
);


// ── UPLOAD (Cloudinary pre-upload, frontend uchun) ───────────────────────────
adsRouter.post(
  "/upload",
  upload.array("goods_picture", 3),
  adsController.UPLOAD_IMAGES
);

// ── UPDATE: ixtiyoriy yangi rasmlar ──────────────────────────────────────────
adsRouter.put(
  "/update/:id",
  upload.array("goods_picture", 3),   // ← single → array
  adsController.UPDATE
);

adsRouter.post("/share", adsController.SHARE_ADS);
adsRouter.delete("/delete/:id", adsController.DELETE);