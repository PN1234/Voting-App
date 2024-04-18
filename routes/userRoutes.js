const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');


const IsAdmin = async (roles) => {
const user = await User.findOne({role:roles})
if(user===null) return false;
else {
    return user.role === 'admin';
}
}

//Post rout to add a person
router.post('/signup',async function(req,res){
   try{
      const data = req.body; //Assuming the request body contains the User data

      //Create a new User document using the Mongoose model
      const newuser = new User(data); 
      
      // Save the new user to the database
      if(await IsAdmin(newuser.role)) return res.status(403).json({error:"There can only be one admin"})

      const response = await newuser.save();
      console.log("data saved");

      const payload = {
        id:response.id
      }
      console.log(JSON.stringify(payload));

      const token = generateToken(payload);
      console.log("Token is:",token);

      res.status(200).json({response:response,token:token});
      
   }
   catch(error){
   console.log(error);
   res.status(500).json({error:'Internal server error'});
   }
})
//Login route

router.post('/login',async (req,res) => {
     
     try
     {
        //Extract aadharcardnumber and password from request body
     const {aadharCardNumber,password} = req.body;
        
        //Find the user by aadharcardnumber
        const user = await User.findOne({aadharCardNumber:aadharCardNumber});

        //If user does not exist or password does not match return error 
        if(!user || !await user.comparePassword(password)){
             return res.status(401).json({error:"Invalid Username or password"});
          }
          //generate token
          const payload = {
            id:user.id
          }
     const token = generateToken(payload);

     //return token as response
      res.json({token});
      }
      
catch(error){
    console.log(error);
    res.status(500).json({error:error});
}

     
})
//Profile route
router.get('/profile',jwtAuthMiddleware,async (req,res) => {
    try{
        const userData = req.user;
        const userid = userData.id;
        const user = await User.findById(userid);
        res.status(200).json({user});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
})

router.put('/profile/password',jwtAuthMiddleware,async function(req,res){
  try{
  	const userid = req.user; // Extract the id from the token
    const {currentPassword,newPassword} = req.body; // Extract current and new password from request body
    

    // Find the user by userID 
    const user = await User.findById(userid);
     
    //Find currentPassword from database and compare it with password entered by the user 
    if(!(await user.comparePassword(currentPassword))){

            return res.status(401).json({error:"Invalid username or password"});
    
         }

         // Udate the user's  password
         user.password = newpassword;
         await user.save();
         console.log("Password Updated Successfully");

         res.status(200).json({message:"Password updated"});  
}
catch(error) {
    console.log(error);
res.status(500).json({error:"Internal Server Error"});
}
})


module.exports = router;