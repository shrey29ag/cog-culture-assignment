const mongoose = require('mongoose');

const GeoTrackingSchema = new mongoose.Schema({
  query: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true }, // e.g., 'Model A', 'Model B', 'Model C'
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeoTracking', GeoTrackingSchema);
