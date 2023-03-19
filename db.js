const mongoose=require('mongoose');

const mongoURI=process.env.MONGO_URL
mongoose.set("strictQuery", false);

const connectTOMongo=async()=>
{
mongoose.connect(mongoURI,()=>
{
    console.log("connected to mongo successfully")
})
}

module.exports=connectTOMongo;