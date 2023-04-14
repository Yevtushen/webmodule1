import mongoose from "mongoose";
import express from 'express';
import config from './config/config.mjs';
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
 
const app = express();
const jsonParser = express.json();
const port = config.PORT;
const mongourl = config.MONGODB_URL;
const jwtok = config.JWT_SECRET;
var token = "";

app.use(cookieParser());

mongoose.connect(mongourl);

const studentSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    name:{type:String,required:true},
    lastname:{type:String,required:true}
},{collection:'students'});

const Student = mongoose.model("Student",studentSchema);
 
const verifyUsername = async (username)=>{
    try {
        const student = await Student.findOne({username}).lean()
        if(!student){
            return {status:'error',error:'Student with such username was not found'}
        }
        token = jwt.sign({id:student._id, username:student.username, name:student.name, lastname: student.lastname, type:'student'},jwtok,{ expiresIn: '2h'})
        return {status:'ok',data:token}
    } catch (error) {
        console.log(error);
        return res.sendStatus(500)
    }
}

const verifyToken = (currToken)=>{
    try {
        const verify = jwt.verify(currToken,jwtok);
        if(verify.type==='student'){return true;}
        else{return false};
    } catch (error) {
        console.log(JSON.stringify(error),"error");
        return false;
    }
}

app.get("/api/students", async (req, res)=>{
    const students = await Student.find({});
    res.send(students);
});

app.get("/api/:username", async(req, res)=>{
    const username = req.params.username;
    const response = await verifyUsername(username);
    if(response.status==='ok'){
        res.cookie('token',token,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });  // maxAge: 2 hours
        res.send("Token saved.");
    }else{
        res.json(response);
    }
});
     
app.post("/api/", jsonParser, async (req, res) =>{
         
    if(!req.body) return res.sendStatus(400);
    var currToken = req.cookies.token;
    if(verifyToken(currToken)){
        const student = new Student({username: req.body.username, name: req.body.name, lastname: req.body.lastname});
        await student.save();
        res.send(student);
    }else{
        return res.sendStatus(403);
    }
});
 
app.listen(port, () => {
    console.log('App running on port', port);
})
