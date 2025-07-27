//https//:localhost/api/user/webhooks
import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import razorpay from 'razorpay';
import transactionModel from "../models/transactionModel.js";
const clerkWebhooks = async (req, res) => {
    
}

//api controller function to get  the user data
const userCredits = async (req, res) => {
    try {
        const clerkId = req.clerkId;
        const userData = await userModel.findOne({ clerkId })
        console.log(userData)
        res.json({ success: true, credits: userData.creditBalance });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//gateway initialize
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//api to make payment for credits 
const paymentRazorpay = async (req, res) => {
    try {
        const clerkId = req.clerkId;
        console.log(req.body);
        const { planId } = req.body;

        const userData = await userModel.findOne({ clerkId })
        if (!userData || !planId) {
            res.json({ success: false, message: "invalid credentials" })
        }

        let credits, plan, amount, date

        switch (planId) {
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;

            case 'Advance':
                plan = 'Advance'
                credits = 500
                amount = 50
                break;

            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
                break;

            default:
                break;
        }
        date = Date.now()

        // creating transaction 

        const transactionData = {
            clerkId,
            plan,
            amount,
            credits,
            date
        }

        const newTransaction = await transactionModel.create(transactionData);

        const options = {
            amount: amount * 100,
            currency: process.env.currency,
            receipt: newTransaction._id,
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                return res.json({ success: false, message: error })
            }

            res.json({ success: true, order })

        })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}

//API controller function to verify razorpay payment 
const verifyRazorpay = async (req, res) => {
    try {

        const { razorpay_order_id } = req.body;
        console.log(req.body);
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (orderInfo.status === 'paid') {
            const transactionData = await transactionModel.findById(orderInfo.receipt);
            if (transactionData.payment) {
                return res.json({ success: false, message: 'payment  failed' })
            }

            //adding credit in user data
            const userData = await userModel.findOne({ clerkId: transactionData.clerkId })
            const creditBalance = userData.creditBalance + transactionData.credits;
            await userModel.findByIdAndUpdate(userData._id, { creditBalance })

            //making payment true
            await transactionModel.findByIdAndUpdate(transactionData._id, { payment: true });
            res.json({ success: true, message: "credit Added " })
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay };
