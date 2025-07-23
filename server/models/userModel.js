import mongoose from 'mongoose'
const userSchema=new mongoose.Schema({
     clerkId:{type:String,required,unique:true},
     email:{type:String,required,unique:true},
     photo:{type:String,required},
     firstName:{type:String,required},
     lastName:{type:String,required},
     creditBalance:{type:Number,default:5}
})

const userModel=mongoose.models.user||mongoose.model('user',userSchema);

export default userSchema;