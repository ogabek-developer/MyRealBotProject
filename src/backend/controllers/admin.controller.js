import { globalError } from "shokhijakhon-error-handler";
import Admin from "../models/Admin.model.js";
import {
    adminCreateSchema,
    adminUpdateSchema,
} from "../../utils/admin.validation.js";

export default {
    async GET(req, res) {
        try {
            const admins = await Admin.findAll({
                order: [["id", "DESC"]],
            });

            return res.status(200).json(admins);
        } catch (error) {
            return globalError(error, res);
        }
    },

    async GET_TG(req, res) {
        try {
            const { tg_username } = req.params;

            const admin = await Admin.findOne({
                where: { tg_username },
            });

            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            return res.status(200).json(admin);
        } catch (error) {
            return globalError(error, res);
        }
    },

    async CREATE(req, res) {
        try {
            const { error, value } = adminCreateSchema.validate(req.body);

            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const admin = await Admin.create(value);

            return res.status(201).json(admin);
        } catch (error) {
            return globalError(error, res);
        }
    },

    async UPDATE(req, res) {
        try {
            const { tg_username } = req.params;

            const { error, value } = adminUpdateSchema.validate(req.body);

            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const admin = await Admin.findOne({
                where : {tg_username}
            });

            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            await admin.update(value);

            return res.status(200).json(admin);
        } catch (error) {
            return globalError(error, res);
        }
    },

    async DELETE(req, res) {
        try {
            const { tg_username } = req.params;

            const admin = await Admin.findOne({where : {tg_username}});

            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            await admin.destroy();

            return res.status(200).json({ message: "Admin deleted successfully" });
        } catch (error) {
            return globalError(error, res);
        }
    },
};
