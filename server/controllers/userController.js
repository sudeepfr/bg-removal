//https//:localhost/api/user/webhooks
import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import razorpay from 'razorpay';
import transactionModel from "../models/transactionModel.js";
const clerkWebhooks = async (req, res) => {
    try{

         const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET)
         await whook.verify(JSON.stringify(req.body),{
            "svix-id":req.headers["svix-id"],
            "svix-timestamp":req.headers["svix-timestamp"],
            "svix-signature":req.headers["svix-signature"]
         })
         const {data,type}=req.body;
         switch (type) {
            case "user.created":{
                const userData={
                     clerkId:data.id,
                     email:data.email_addresses[0].email_address||"",
                     firstName:data.first_name,
                     lastName:data.last_name ||"",
                     photo:data.image_url,
                     
                }
                await userModel.create(userData);
                res.json({});
                break;
            }

            case "user.updated":{
                const userData={
                 
                     email:data.email_addresses[0].email_address||"",
                     firstName:data.first_name,
                     lastName:data.last_name ||"",
                     photo:data.image_url,
                     
                }
                await userModel.findOneAndUpdate({clerkId:data.id},userData);
                res.json({});
                break;
            }
             case 'user.deleted':{
                await userModel.findOneAndDelete({clerkId:data.id})
                res.json({})
                break;
             }
            default:
                break;
         }
    }catch(error){
      console.log(error.message);
      res.json({success:false,message:error.message})
    }
}

// api to sync user from frontend (fallback to webhook for local dev)
const syncUser = async (req, res) => {
    try {
        const clerkId = req.clerkId;
        const { email, firstName, lastName, photo } = req.body;

        let user = await userModel.findOne({ clerkId });
        if (!user) {
            // Create user if they don't exist (webhook may not have fired in local dev)
            user = await userModel.create({
                clerkId,
                email: email || '',
                firstName: firstName || '',
                lastName: lastName || '',
                photo: photo || '',
            });
            console.log('User created via sync:', clerkId);
        } else {
            // Update profile info in case it changed
            await userModel.findByIdAndUpdate(user._id, { email, firstName, lastName, photo });
        }

        res.json({ success: true, credits: user.creditBalance });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//api controller function to get  the user data
const userCredits = async (req, res) => {
    try {
        const clerkId = req.clerkId;
        console.log(clerkId);
        const userData = await userModel.findOne({ clerkId })
        if (!userData) {
            return res.json({ success: false, message: 'User not found. Please make sure your Clerk webhook is configured correctly.' });
        }
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
            return res.json({ success: false, message: "invalid credentials" })
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
            currency: process.env.CURRENCY,
            receipt: newTransaction._id.toString(),
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
            if (!userData) {
                return res.json({ success: false, message: 'User not found' });
            }
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
export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay, syncUser };
