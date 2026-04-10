class PaymentService {
  /**
   * Generates a Razorpay Order ID for completing checkout flow.
   * Note: Mock implementation. Production requires Razorpay SDK `const Razorpay = require('razorpay');`
   */
  static async createOrder(amount, receiptId) {
    try {
      // In production:
      // const instance = new Razorpay({ key_id: '...', key_secret: '...' })
      // return await instance.orders.create({ amount: amount * 100, currency: "INR", receipt: receiptId });
      
      return {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100, // paise
        currency: 'INR',
        receipt: receiptId,
        status: 'created'
      };
    } catch (error) {
       console.error("Payment creation error:", error);
       throw error;
    }
  }

  static verifyWebhookSignature(payload, signature, secret) {
    // In production: import crypto and verify hash
    return true; // Mock accept all
  }
}

module.exports = PaymentService;
