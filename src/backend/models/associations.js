import Client from "./Client.model.js";
import Advertisement from "./Ads.model.js";
import AdView from "./AdView.model.js";

// Client ↔ Advertisement
Client.hasMany(Advertisement, {
  foreignKey: "clientId",
  as: "ads",
  onDelete: "CASCADE",
});

Advertisement.belongsTo(Client, {
  foreignKey: "clientId",
  as: "client",
});

// Advertisement ↔ AdView
Advertisement.hasMany(AdView, {
  foreignKey: "ad_id",
  as: "adViews",
  onDelete: "CASCADE",
});

AdView.belongsTo(Advertisement, {
  foreignKey: "ad_id",
  as: "advertisement",
});

export { Client, Advertisement, AdView };