const jsonwebtoken = require('jsonwebtoken');

const SECRET_KEY =  process.env.SECRET_KEY;
//console.log(SECRET_KEY);
const tokenSign = async (createdUser) =>{
  const sign = await jsonwebtoken.sign({
  _id: createdUser.id,
      },
   SECRET_KEY,
  {
    expiresIn: "10080m"
  }
   
)

return sign ;
};

const verifyToken = async (token)=>{

    try {
        return jsonwebtoken.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}


module.exports = {tokenSign, verifyToken};