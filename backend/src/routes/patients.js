

const {Router} = require('express');

const { authMiddleware } = require('../middleware/auth');
const {fetchAllPatients, fetchPatientsByChairId, fetchPatientById} = require('../services/patientService')

const router = Router();

router.get('/by-chair/:chairId', authMiddleware, async(req, res) => {
    try {
        const { chairId } = req.params;
        if (!chairId) {
            return res.status(400).json({ error: 'chairId parameter is required' });
        }
        const patients = await fetchPatientsByChairId(chairId);
        return res.json(patients);
    } catch (err) {
        console.error('Error fetching patients by chair:', err);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/',authMiddleware, async(req,res)=>{
    console.log('Fetching clinic related patients using clinic id:',req.query)
    try{
        const clinicId = req.query.clinicId;
        if (!clinicId) {
            return res.status(400).json({ error: 'clinicId query parameter is required' });
        }
        const result = await fetchAllPatients(clinicId);
        console.log('All patients fetched', result)
        return res.json(result)
    }
    catch(err){
        console.log('Error fetching patients:',err)
        return res.status(500).json({ error: err.message })
    }
} )

router.get('/:id', async(req,res)=>{
    try {
        const { id } = req.params;
        console.log('Attempting to fetch patient with this id:', id);
        const response = await fetchPatientById(id);
        console.log('Patient fetched successfully:', response);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error fetching patient:', err);
        res.status(500).json({ error: err.message });
    }
})

module.exports = router