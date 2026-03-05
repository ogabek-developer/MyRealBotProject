import express from "express";
import adminController from "../controllers/admin.controller.js";

export const adminRouter = express.Router() ;

adminRouter.post('/create',adminController.CREATE) ;
adminRouter.get('/get/all', adminController.GET) ;
adminRouter.get("/get/:tg_username", adminController.GET_TG) ;
adminRouter.put('/update/:tg_username', adminController.UPDATE) ;
adminRouter.delete('/delete/:tg_username', adminController.DELETE) ;
