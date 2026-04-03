const prisma = require('../db/client')

const joinWaitList=async(data)=>{
    const existingEmail = await prisma.waitList.findFirst({
        where:{email:data.email}
    })
    if(existingEmail){
        throw new ExistingReferralError('The email user has already joined the waitlist')


    }

    const newJoin = await prisma.waitList.create({
        data:data
    })
    return newJoin

}

module.exports={
    joinWaitList
}