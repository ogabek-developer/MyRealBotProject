import express from "express";
import {
  addView,
  getAllViews,
  getViewsByUser,
  getViewsByAd,
  getViewsStats,
  deleteView,
  deleteUserViews,
} from "../controllers/view.controller.js";

const router = express.Router();

// View qo'shish
router.post("/view/:adId", addView);

// Barcha viewslar
router.get("/view/all", getAllViews);

// Statistika (user va ad dan oldin bo'lishi kerak)
router.get("/view/stats", getViewsStats);

// User bo'yicha viewslar
router.get("/view/user/:userId", getViewsByUser);

// E'lon bo'yicha viewslar
router.get("/view/ad/:adId", getViewsByAd);

// View o'chirish
router.delete("/view/:viewId", deleteView);

// User viewslarini o'chirish
router.delete("/view/user/:userId", deleteUserViews);

export default router;