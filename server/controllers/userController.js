//https//:localhost/api/user/webhooks
import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import razorpay from 'razorpay';
import transactionModel from "../models/transactionModel.js";
const clerkWebhooks = async (req, res) => {
    try {
        console.log("Webhook hit!", req.headers);
        //create svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        const payload = req.body

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };
        const evt = whook.verify(payload, headers);

        const { data, type } = evt;
        console.log(" Webhook type:", type);

        switch (type) {
            case "user.created": {
                console.log("📦 Full user.created payload:", JSON.stringify(data, null, 2));
                const email =
                    data.email_addresses &&
                        data.email_addresses.length > 0 &&
                        data.email_addresses[0].email_address
                        ? data.email_addresses[0].email_address
                        : null;

                if (!email) {
                    console.error(" Email not found in Clerk webhook payload");
                    return res.status(400).json({
                        success: false,
                        message: "Email address not found in webhook payload",
                    });
                }


                const userData = {
                    clerkId: data.id,
                    email,
                    photo: data.image_url,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                };
                const existingUser = await userModel.findOne({ clerkId: data.id });
                if (existingUser) {
                    console.log("User already exists:", existingUser.email);
                    return res.status(200).json({ success: true, message: "User already exists" });
                }
                try {
                    await userModel.create(userData);
                    console.log(" User created successfully");
                    return res.json({ success: true, user: userData })

                } catch (err) {
                    console.error(" Error creating user:", err.message);
                }
                break;

            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address || "",
                    photo: data.image_url,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                };
                await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
                res.json({ success: true, message: "User updated successfuly" });

                break;
            }
            case "user.deleted": {
                await userModel.findOneAndDelete({ clerkId: data.id });
                res.json({ success: true, message: "User Deleted successfuly" });
                break;
            }
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
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
