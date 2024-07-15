const storageModel = require('../../models/storage');
const PUBLIC_URL = process.env.PUBLIC_URL;
const {handleHttpError} = require('../../utils/handleError');
const fs = require('fs');

const createFile = async (req,res)=>{

  try {
    const {file} = req 
    console.log(file);
    

    const fileObject = 
    {
        
    filename: file.filename,
    url: `${PUBLIC_URL}/${file.filename}`
    }

    
    
const data = await storageModel.create( fileObject )
res.status(201).send(data)
    
      
  } catch (error) {
    
  }


}



module.exports = {createFile};