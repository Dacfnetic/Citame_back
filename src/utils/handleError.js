const handleHttpError  = (res, message = "algo ha sucedido",  code = 403) =>{
         
    res.send({message: `${message}`}).status(code);
}


module.exports = {handleHttpError};