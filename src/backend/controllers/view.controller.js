import { Op } from "sequelize"; // ⭐ Bu import qo'shilishi kerak!
import AdView from "../models/AdView.model.js";
import Advertisement from "../models/Ads.model.js";
import Client from "../models/Client.model.js";

/**
 * POST: /ads/view/:adId
 * E'lon ko'rilganini qayd qilish
 */
export const addView = async (req, res) => {
  const { adId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: "user_id majburiy",
    });
  }

  try {
    // E'lon mavjudligini tekshirish
    const ad = await Advertisement.findByPk(adId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "E'lon topilmadi",
      });
    }

    // Viewni saqlash (har bir user faqat bir marta)
    const [view, created] = await AdView.findOrCreate({
      where: { ad_id: adId, user_id: user_id },
      defaults: {
        ad_id: adId,
        user_id: user_id,
      },
    });

    // Agar yangi view bo'lsa, views countni oshirish
    if (created) {
      await ad.increment("views");
      await ad.reload(); // ⭐ Yangilangan qiymatni olish uchun
    }

    res.json({
      success: true,
      newView: created,
      totalViews: ad.views,
      message: created
        ? "Ko'rish qayd qilindi"
        : "Siz bu e'lonni allaqachon ko'rgansiz",
    });
  } catch (err) {
    console.error("View qo'shishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};

/**
 * GET: /ads/view/all
 * Barcha viewslarni olish
 */
export const getAllViews = async (req, res) => {
  try {
    const views = await AdView.findAll({
      include: [
        {
          model: Advertisement,
          as: "advertisement",
          required: false, // ⭐ LEFT JOIN
          include: [
            {
              model: Client,
              as: "client",
              required: false, // ⭐ LEFT JOIN
              attributes: ["id", "tg_id", "name", "phone"],
            },
          ],
        },
      ],
      order: [["viewed_time", "DESC"]],
    });

    res.json({
      success: true,
      count: views.length,
      views,
    });
  } catch (err) {
    console.error("Viewslarni olishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};

/**
 * GET: /ads/view/user/:userId
 * Faqat bitta userning ko'rgan e'lonlari
 */
export const getViewsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const views = await AdView.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Advertisement,
          as: "advertisement",
          required: false,
          include: [
            {
              model: Client,
              as: "client",
              required: false,
              attributes: ["id", "tg_id", "name", "phone"],
            },
          ],
        },
      ],
      order: [["viewed_time", "DESC"]],
    });

    res.json({
      success: true,
      count: views.length,
      views,
    });
  } catch (err) {
    console.error("User viewslarni olishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};

/**
 * GET: /ads/view/ad/:adId
 * Bitta e'lonning barcha viewslari
 */
export const getViewsByAd = async (req, res) => {
  const { adId } = req.params;

  try {
    const ad = await Advertisement.findByPk(adId, {
      include: [
        {
          model: AdView,
          as: "adViews",
          separate: true, // ⭐ Order ishlatish uchun
          order: [["viewed_time", "DESC"]],
        },
      ],
    });

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: "E'lon topilmadi",
      });
    }

    res.json({
      success: true,
      advertisement: ad.advertisement_name,
      totalViews: ad.views,
      uniqueViews: ad.adViews ? ad.adViews.length : 0,
      views: ad.adViews || [],
    });
  } catch (err) {
    console.error("Ad viewslarni olishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};

/**
 * GET: /ads/view/stats
 * Ko'rishlar statistikasi
 */
export const getViewsStats = async (req, res) => {
  try {
    const totalViews = await AdView.count();
    const totalAds = await Advertisement.count();
    const adsWithViews = await Advertisement.count({
      where: { 
        views: { 
          [Op.gt]: 0 // ⭐ Op import qilingan
        } 
      },
    });

    // Eng ko'p ko'rilgan e'lonlar
    const topViewed = await Advertisement.findAll({
      order: [["views", "DESC"]],
      limit: 10,
      include: [
        {
          model: Client,
          as: "client",
          required: false,
          attributes: ["id", "name", "tg_id"],
        },
      ],
      attributes: ["id", "advertisement_name", "views", "price", "region", "model"],
    });

    res.json({
      success: true,
      stats: {
        totalViews,
        totalAds,
        adsWithViews,
        adsWithoutViews: totalAds - adsWithViews,
      },
      topViewed,
    });
  } catch (err) {
    console.error("Statistikani olishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};

/**
 * DELETE: /ads/view/:viewId
 * Bitta viewni o'chirish
 */
export const deleteView = async (req, res) => {
  const { viewId } = req.params;

  try {
    const view = await AdView.findByPk(viewId);
    
    if (!view) {
      return res.status(404).json({
        success: false,
        error: "View topilmadi",
      });
    }

    const adId = view.ad_id;
    await view.destroy();

    // Advertisement views countni kamaytirish
    await Advertisement.decrement("views", { 
      where: { id: adId } 
    });

    res.json({
      success: true,
      message: "View o'chirildi",
    });
  } catch (err) {
    console.error("View o'chirishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};

/**
 * DELETE: /ads/view/user/:userId
 * User barcha viewslarini o'chirish
 */
export const deleteUserViews = async (req, res) => {
  const { userId } = req.params;

  try {
    const views = await AdView.findAll({
      where: { user_id: userId },
    });

    if (views.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Bu user uchun viewslar topilmadi",
      });
    }

    // Har bir ad uchun count kamaytirish
    const adIds = [...new Set(views.map(v => v.ad_id))];
    
    for (const adId of adIds) {
      const count = views.filter(v => v.ad_id === adId).length;
      await Advertisement.decrement("views", { 
        where: { id: adId },
        by: count,
      });
    }

    // Viewslarni o'chirish
    await AdView.destroy({
      where: { user_id: userId },
    });

    res.json({
      success: true,
      deletedCount: views.length,
      message: `${views.length} ta view o'chirildi`,
    });
  } catch (err) {
    console.error("User viewslarini o'chirishda xato:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Serverda xatolik yuz berdi",
    });
  }
};