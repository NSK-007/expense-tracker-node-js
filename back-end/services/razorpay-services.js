const RazorPay = require('razorpay');
const connectToRazorPay = () => {
    return new RazorPay({
        key_id: process.env.RAZOR_PAY_KEY_ID,
        key_secret: process.env.RAZOR_PAY_KEY_SECRET
    });
}

module.exports = {
    connectToRazorPay
}