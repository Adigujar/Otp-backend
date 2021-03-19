const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const nodemailer = require("nodemailer");


const router = express();
router.use(express.json());
router.use(cors());


const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;
const DB_URL = process.env.DBURL 
const Email= process.env.Email
const Pass= process.env.Pass



var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

var mailOptions={
   subject: "Otp for registration is: ",
   html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
 };

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    
    auth: {
      user: Email,
      pass: Pass
    }
    
});

router.get('/',async(res,req)=>{
    res.send("welcome")
})
router.post('/send', async(req, res) => {
    try {
        let client = await mongoClient.connect(DB_URL)
        let db = client.db("Otp-project");
        const data ={
            email: req.body.email,
            pin: otp,
            string: req.body.string
        }
        await db.collection("complaints").insertOne(data)
        mailOptions.to = req.body.email
        await transporter.sendMail(mailOptions)
        let new_complaint =await db.collection("complaints").find().toArray()
        client.close()
        res.json(new_complaint)
    } catch (error) {
        res.json({
            message:"Someting Went Worng"})
        
    }
})

router.post('/verify', async(req, res) => {
    try {
        let client = await mongoClient.connect(DB_URL)
        let db = client.db("Otp-project");
        var query = { string: req.body.string };
        let get_email = await db.collection("complaints").find(query).toArray()
        console.log(get_email)
        if(req.body.pin==get_email[0].pin){
            res.status(200).json({message: "account verifed successfully"});
        }else{
            res.status(404).json({ message: "enter correct OTP" });
          }
        client.close()
        res.json(get_email)
    } catch (error) {
        res.json({
            message:"Someting Went Worng"})
        
    }
})

router.post('/resigter', async(req, res) => {
    try {
        let client = await mongoClient.connect(DB_URL)
        let db = client.db("Otp-project");
        var myquery = { string:req.body.string};
        var newvalues = { $set: {complaints:req.body.complaints } };
        let update = await db.collection("complaints").updateOne(myquery, newvalues)
        client.close()
        res.status(200).json({message:"Complaint raised"})
    } catch (error) {
        res.json({
            message:"Someting Went Worng"})
        
    }
})


const PORT=process.env.PORT||3001;
router.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
})
