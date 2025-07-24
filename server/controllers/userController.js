//https//:localhost/api/user/webhooks
import { Webhook } from "svix";
import userModel from "../models/userModel.js";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("Webhook hit!");
        //create svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        const payload = req.body.toString();

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
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    photo: data.image_url,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                };
                const existingUser = await userModel.findOne({ clerkId: data.id });
                if (existingUser) {
                    console.log("User already exists:", existingUser.email);
                    break;
                }
                try {
                    await userModel.create(userData);
                    console.log(" User created successfully");
                    res.json({ success: true, user: userData })

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
        const {clerkId}=req.body;
        const userData =await userModel.findOne({clerkId})
        res.json({success:true,credits:userData.creditBalance});

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export { clerkWebhooks,userCredits };