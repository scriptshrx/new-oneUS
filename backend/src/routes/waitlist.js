const router = require('express')

const {
   joinWaitList
} = require('../services/waitListService');

//Join waitlist
router.post('/', async(req,res)=>{
    console.log('Visitor joining waitlist as:',req.body)

    try{
        const response = await joinWaitList(req.body);

    console.log('The above visitor has successfully joined the wait list')
    res.json(response)
    }
    catch(err){
        res.json(err)

    }
})

module.exports = router;