const prisma = require('../db/client')

const joinWaitList=async(data)=>{
    const existingEmail = await prisma.waitList.findFirst({
        where:{email:data.email}
    })
    if(existingEmail){
        throw new Error('The email has already joined the waitlist')
    }

    const newJoin = await prisma.waitList.create({
        data:data
    })
    return newJoin

}

/**
 * Fetch all waitlist data from the databases
 */
async function getAllWaitlist() {
  try {
    const waitlist = await prisma.waitList.findMany();
    return waitlist;
  } catch (error) {
    console.error('Error fetching waitlist data:', error);
    throw error;
  }
}

module.exports={
    joinWaitList,
    getAllWaitlist,
}