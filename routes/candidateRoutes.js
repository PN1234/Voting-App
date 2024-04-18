const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');
const Candidate = require('./../models/candidate');

const checkAdminRole = async (userID) => {
   try{
    const user = await User.findById(userID);
       return user.role === 'admin';
   }
   catch(error){
    console.log(error);
    return false;
   }    
}

//Post rout to add a person
router.post('/',jwtAuthMiddleware,async (req,res) => {
   try{
       if(! await checkAdminRole(req.user.id))
       return res.status(403).json({error:"User do not have admin role"})
      
       const data = req.body; //Assuming the request body contains the User data

      //Create a new User document using the Mongoose model
       const newCandidate = new Candidate(data);

      // Save the new user to the database 
       const response = await newCandidate.save();
       console.log("data saved");

      res.status(200).json({response:response});
}
   catch(error){
   console.log(error);
   res.status(500).json({error:'Internal server error'});
   }
})


router.put('/:candidateID',jwtAuthMiddleware,async function(req,res){
  try{
     if(!checkAdminRole(req.user.id)) 
        return res.status(403).json({error:"User do not have admin role"})

    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;

   // Find the user by userID 

    const response = await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
        new:true,
        runValidators:true
    })
        if(!response){
        res.status(404).json({error:"No Such Candidate Found "})
    }
 
        res.status(200).json(response);
        console.log("Data Updated Successfully");

     
}
catch(error) {
res.status(500).json({error:"Internal Server Error"});
}
})

router.delete('/:candidateID',jwtAuthMiddleware,async (req,res) => {
   try{
     if(!checkAdminRole(req.user.id)) return res.status(403).json({error:"User do not have admin role"})

     const candidateID = req.params.candidateID;

   // Find the user by userID 

     const response = await Candidate.findByIdAndDelete(candidateID);
        if(!response) return res.status(404).json({message:"No Such Candidate Found "})
 
        res.status(200).json(response);
        console.log("Candidate Deleted Successfully");
}
catch(error) {
    console.log(error);
return res.status(500).json({error:"Internal Server Error"});
}
})


//let's start voting

router.post('/vote/:candidateID',jwtAuthMiddleware,async (req,res) => {
//no admin can vote
// user can vote only once

const candidateID = req.params.candidateID;
const userId = req.user.id;


try {

const canddidate = Candidate.findById(candidateID);
if(!canddidate){
    return res.status(404).json({message:"Candidate not found"});
}

const user = User.findById(userId); 
if(!user) return res.status(404).json({message:"User not found"});
if(user.isVoted) return res.status(400).json({message:"User has already voted"})
if(user.role == 'admin') return res.status(403).json({message:"Admin is not allowed"});

//Update the Candidate document to record the vote

candidate.votes.push({user:userID});
candidate.votecount++;
await candidate.save();

//update the user document
user.isVoted = true;
await user.save();

res.status(200).json({message:"vote recorded successfully"});

}
catch(error){
    console.log(error);
    res.status(500).json({error:"Internal Server Error"})
}
});


//vote count
router.get('/vote/count',async(req,res) => {
try{
    // Find all candidates and sort them by votecount in descending order
   const candidate = await Candidate.find().sort({votecount:'desc'});
   
   // Map the candidate to only return their name and voteCount
   const voterecord = candidate.map((data) => {
    return {
        party : data.party,
        count:data.votecount
    }
   });
   return res.status(200).json(voterecord);
}
catch(error){
console.log(error);
res.status(500).json({error:"Internal Server Error"})    
}

});

module.exports = router;