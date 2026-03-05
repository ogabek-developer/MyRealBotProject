import { globalError } from "shokhijakhon-error-handler";
import Client from "../models/Client.model.js";
import { clientUpdateSchema } from "../../utils/client.validation.js";

export default {
  // GET ALL CLIENTS
  async GET(req, res) {
    try {
      const clients = await Client.findAll({
        order: [["id", "DESC"]],
      });

      return res.status(200).json(clients);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // GET BY tg_username
  async GET_TG_USERNAME(req, res) {
    try {
      const { tg_username } = req.params;

      const client = await Client.findOne({
        where: { tg_username },
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json(client);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // NEW: GET BY tg_id
  async GET_TG_ID(req, res) {
    try {
      const { tgid } = req.params; // :tgid

      const client = await Client.findOne({
        where: { tg_id: tgid },
      });
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json({ id: client.id }); // faqat ichki client ID ni qaytaradi
    } catch (error) {
      return globalError(error, res);
    }
  },

  // UPDATE CLIENT
  async UPDATE(req, res) {
    try {
      const { id } = req.params;

      const { error, value } = clientUpdateSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const client = await Client.findOne({
        where: { id },
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await client.update(value);

      return res.status(200).json(client);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // DELETE CLIENT
  async DELETE(req, res) {
    try {
      const { id } = req.params;

      const client = await Client.findOne({
        where: { id},
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await client.destroy();

      return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
      return globalError(error, res);
    }
  },
};