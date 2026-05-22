const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, enum: ['pending', 'created', 'paid', 'failed', 'refunded'], default: 'pending' },
    method: { type: String, enum: ['razorpay', 'cod', 'wallet', 'card'], default: 'razorpay' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    rawPayload: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
