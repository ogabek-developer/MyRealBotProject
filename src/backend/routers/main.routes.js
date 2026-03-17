import express from "express";
import { adminRouter } from "./admin.routes.js";
import { clientRouter } from "./client.routes.js";
import { adsRouter } from "./ads.routes.js";
import router from "./adsView.routes.js";

export const mainRouter = express.Router() ;

mainRouter.use('/admin', adminRouter) ;
mainRouter.use('/clients', clientRouter) ;
mainRouter.use('/ads', adsRouter) ;
mainRouter.use('/ads', router)
