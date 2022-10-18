const jwt = require("jsonwebtoken");


module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        if(token) {
            token = token.slice(7);
            jwt.verify(token, process.env.key, (err, decoded) => {
                if(err) {
                    return res.status(403).json({message: "Invalid token"});
                }else {
                    next();
                }
            });
        }else {
            return res.status(401).json({message: "Access denied"});
        }
    }
};