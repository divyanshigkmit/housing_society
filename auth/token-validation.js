const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const connection = require('../config/db');

module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        let userId = req.get("userId");
        // console.log(userId);
        if(token) {
            token = token.slice(7);
            
            if(token) {
                var payload =  JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                let currTime = (Date.now());
                let sql = `SELECT * from users_table WHERE email_id = "${payload.result[0].email_id}" AND token = "${token}" AND token_expiration >= "${currTime}" AND is_admin = 1`;
                connection.query(sql, (err, results) => {
                    
                    if (err) return res.status(400).json({message: err});
                    if(results.length > 0) {
                        if((userId && (results[0].id == userId)) || (!userId)) {
                            next();
                        }
                    }else {
                        return res.status(498).json({message: "Invalid token"});
                    } 
                });
                
            }
        }else {
            return res.status(401).json({message: "Access denied"});
        }
    }
};