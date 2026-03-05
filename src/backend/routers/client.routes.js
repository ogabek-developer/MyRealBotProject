import express from "express";
import clientController from "../controllers/client.controller.js";

export const clientRouter = express.Router() ;

clientRouter.get('/get/all', clientController.GET) ;
clientRouter.get('/get/:tgid', clientController.GET_TG_ID)
// clientRouter.get('/get/:tg_username', clientController.GET_TG_USERNAME);
clientRouter.put('/update/:id', clientController.UPDATE) ;
clientRouter.delete('/delete/:id', clientController.DELETE);