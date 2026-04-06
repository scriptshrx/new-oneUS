

const {Router} = require('express');

const { authMiddleware } = require('../middleware/auth');
const {fetchAllPatients} = require('../services/patientService')

const router = Router();

router.gett('/:clinicId',authMiddleware, async(req,res)=>{
    console.log('Fetching clinic related patients using clinic id:',req.params)
    try{
        const clinicId =req.params;

    const result = await fetchAllPatients(clinicId);
    res.json(result)
    }
    catch(err){
        console.log('Erro fetching patients:',err)
    }
} )

module.exports = router