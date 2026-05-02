const {Router} = require('express')

const {
   joinWaitList,
   getAllWaitlist
} = require('../services/waitListService');

const router = Router()

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

// Route to fetch all waitlist data
router.get('/', async (req, res) => {
  try {
    const waitlist = await getAllWaitlist();
    res.status(200).json(waitlist);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

module.exports = router;