import express from "express";
import adsController from "../controllers/ads.controller.js";
import { upload } from "../middlewares/multer.js";

export const adsRouter = express.Router();

adsRouter.get("/get/all", adsController.GET_ALL);
adsRouter.get("/get/:id", adsController.GET_BY_ID);
adsRouter.post("/admin/ad",
  upload.single("goods_picture"),
  adsController.CREATE_ADMIN_AD
)

adsRouter.post(
  "/create",
  upload.single("goods_picture"),
  adsController.CREATE
);


adsRouter.post('/share', adsController.SHARE_ADS)

adsRouter.get('/get/client/by', adsController.GET_ALL_ADS_BYCLIENT)

adsRouter.get("/get/region/:region", adsController.GET_BY_REGION);

adsRouter.put(
  "/update/:id",
  upload.single("goods_picture"),
  adsController.UPDATE
);

adsRouter.delete("/delete/:id", adsController.DELETE);
