

const {Router} = require('express');

const { authMiddleware } = require('../middleware/auth');
const {
  fetchAllPatients,
  fetchPatientsByChairId,
  fetchPatientById,
  updatePatient,
  archivePatient,
  permanentDeletePatient,
} = require('../services/patientService');

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

router.patch('/:id', authMiddleware, async(req,res)=>{
    try {
        const { id } = req.params;
        console.log('Attempting to update patient with this id:', id);
        console.log('Update data:', req.body);
        const updatedPatient = await updatePatient(id, req.body);
        console.log('Patient updated successfully:', updatedPatient);
        res.status(200).json(updatedPatient);
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    if (permanent) {
      const deleted = await permanentDeletePatient(id);
      return res.json({
        success: true,
        message: 'Patient permanently deleted',
        patientId: deleted.id,
      });
    }

    const archived = await archivePatient(id);
    return res.json({
      success: true,
      message: 'Patient archived',
      patientId: archived.id,
      data: archived,
    });
  } catch (err) {
    console.error('Error deleting patient:', err);
    const statusCode = err.message === 'Patient not found' ? 404 : 400;
    return res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;