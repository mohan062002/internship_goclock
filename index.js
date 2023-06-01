const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
//for configuring the env file
require("dotenv").config();
//for encreption and decreption of passward
const bcrypt = require("bcrypt");
const bcryptSalt = bcrypt.genSaltSync(10); //converts the passward into 10 digit hash
//for generating jwt tokens
const jwt = require("jsonwebtoken");
const jwtSecret = "wwoiwosskvnieruhgfgkrjtho";
//for sending cookies to the browser
const cookieParser = require("cookie-parser");

//setting middlewares
app.use(express.json());
app.use(cookieParser());

const BASE_URL=process.env.BASE_URL;
const PORT=process.env.PORT || 5000;

// cors middleware configuration
const corsOptions = {
  origin:BASE_URL,
  credentials: true, //access-control-allow-credentials:tru
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

//connecting to the database
mongoose.connect(process.env.MONGO_URL);
// importing the models
const User = require("./models/User");
const User1 = require("./models/User1");
const Transport = require("./models/Transport");
const Manufacture = require("./models/Manufacture");


app.get("/test", (req, res) => {
  res.send("Hello World");
});

app.post("/register", async (req, res) => {
  const { position, name, email, address, password,confpassword} = req.body;
  console.log("position is ", position, "name is ", name, "email is ", email, "address is ", address, "password is ", password, "confpassword is ", confpassword);
  try {
    if (position === "Manufacturer") {
      console.log("position is manufacturer")
      if (password === confpassword) 
      {   
        console.log("passward is matched");
        const userDoc = await User.create
        ({
          name,
          email,
          address,
          password: bcrypt.hashSync(password, bcryptSalt), //encrepting passward using hashsync
        });
        console.log(userDoc);
        res.json(userDoc);
      }
      else
      {
        res.json("unfortunitely notfound");
      }
    }
     else if (position === "Transporter") 
     {
      if (password === confpassword)
       {
        const userDoc = await User1.create({
          name,
          email,
          address,
          password: bcrypt.hashSync(password, bcryptSalt), //encrepting passward using hashsync
        });
        console.log(userDoc);
        res.json(userDoc);
      }
      else
      {
        res.json("unfortunitely notfound");
      }
    }
  }
   catch (e) 
   {
    res.status(422).json(e);
   }
});


app.post("/login", async (req, res) => {
  const { position, lname, lpass } = req.body;
  let resultDoc;
  if (position === "Manufacturer") {
    resultDoc = await User.findOne({ email: lname });
  } else if (position === "Transporter") 
  {
    resultDoc = await User1.findOne({ email: lname });
  }
  if (resultDoc) {
    const passok = bcrypt.compareSync(lpass, resultDoc.password); //comparing the passward by decrepting previously stored passward
    if (passok) 
    {
      //initalizing jwt tokens with the data
      jwt.sign(
        {email: resultDoc.email,id: resultDoc._id,pos:position,name: resultDoc.name},
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(resultDoc);
        }
      );
    } 
    else 
    {
      res.json("unfortunitely notfound");
    }
  } else {
    res.json("not found");
  }

});


app.post("/logout", (req, res) => {
  res.cookie("type", "").json(true);
});


//ekda coockie set zali ki data set karne using usercontext
app.get("/profile", (req, res) => {
  const { token } = req.cookies; // should print cookies sent by the client
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, user) => {
      if (err) throw err;
      const temp=user.pos; 
      if(temp==="Manufacturer")
      {
        const userDoc = await User.findById(user.id);
        // console.log("user document is ",userDoc)
        res.json(userDoc);
      }
      else if(temp==="Transporter")
      {
        const userDoc = await User1.findById(user.id);
        // console.log("user document is ",userDoc)
        res.json(userDoc);
      }
    });
  } else {
    res.json(null);
  }

  // res.send(token);
});





//manufacturer is sending message to transporter
app.post("/manufacturermessages", async (req, res) => {
  const {  
    Mname,
    genstring,
    address,
    to,
    from,
    quantity,
    trans} = req.body;
    console.log(Mname,"genstring is ",genstring,"address is ",address,"to is ",to,"from is ",from,"quantity is ",quantity,"transporter is ",trans);
  try {
    const response = await Manufacture.create({
      Mname:Mname,
      Mid:genstring,
      to: to,
      from: from,
      address: address,
      quantity: quantity,
      transporter:trans
    });

    console.log("response is ", response);
    res.json(response);
  } catch (e) {
    res.status(422).json(e);
  }
});

//transporter is sending message to manufacturer
app.post("/Transportermessage",async(req,res)=>{
  const{ price,name,orderid,message}=req.body;
  console.log(price,orderid,name);

  const value =orderid;
const valuesArray = value.split("+");
  const newid=valuesArray[0];
  const man=valuesArray[1];
  console.log(newid,man);

  try{
     const response=await Transport.create({
        amount:price,
        idman:man,    
        orderid:newid,
        from:name,
        message:message
     })
     console.log("transporter message is",response);

    //  const ids=await Manufacture.find({transporter:temp});
    //  console.log("ids are",ids)
    
     res.json(response);
  }
  catch(e)
  {
    res.status(422).json(e);
  }
})

app.post("/transportertomanufacturer",async(req,res)=>{
  const{name}=req.body;
  console.log("manufacturer name is",name);
  try
  {
    const data=await User1.find();
    const data2=await Transport.find({idman:name});
    console.log("data2 is",data2);
    res.json({"data":data,
       "data2":data2
  });
  }
  catch(err)
  {
    res.status(422).json(err);
  }
})



app.post("/searchtransportmessage", async (req, res) => {
  const { searchorderid, searchto, searchfrom, type} = req.body;
  console.log("values are", searchorderid, searchto, searchfrom,type);

  try {
    const query = {};

     if(type==="Trans")
     {
      if (searchorderid) {
        query.Mid = searchorderid;
      }
  
      if (searchto) {
        query.to = searchto;
      }
  
      if (searchfrom) {
        query.from = searchfrom;
      }
     }
     else
     {
      if (searchorderid) {
        query.orderid = searchorderid;
      }
  
      if (searchto) {
        query.idman = searchto;
      }
  
      if (searchfrom) {
        query.from = searchfrom;
      }
     }

    if (Object.keys(query).length > 0) {

      if(type==="Trans")
     { 
      console.log("we are in trans if")
      const data = await Manufacture.find(query);

      console.log("data is", data);
      res.json(data);
     }
     else
      {
        console.log("we are in man if");
        const data = await Transport.find(query);
  
        console.log("data is", data);
        res.json(data);
      }

    } else {
      // No search arguments provided
      res.json([]);
    }
  } catch (e) {
    // Handle error
  }
});




app.post("/getallorderid", async (req, res) => {
  const {name} = req.body;
  console.log("value is 12345",name);

  try {
    const ids=await Manufacture.find({transporter:name});
    console.log("ids are",ids)
    res.json(ids);
  } catch (e) {
    res.status(422).json(e);
  }

});

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});



//rQg0Rzgqj5ardkOU       mannabhau1234