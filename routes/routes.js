const { json } = require('body-parser');
const express = require('express');
const router = express.Router();
const connection = require('../config/db');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkToken } = require('../auth/token-validation');

// Register new user
router.post('/users', checkToken, (req, res) => {
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email_id = req.body.email_id;
    let contact_number = req.body.contact_number;
    let pwd = req.body.pwd;
    let is_admin
    if(req.body.is_admin) {
        is_admin = req.body.is_admin; 
    }else { 
        is_admin = 0; 
    }

    let q = `SELECT * FROM user_table WHERE email_id = "${email_id}" OR contact_number = "${contact_number}"`;

    connection.query(q, (err, data) => {
        if(err) return res.status(400).json({message: err});
        if(data.length > 0) {
            return res.status(409).send("User with this email/contact number already exist.");
        }else {
            bcrypt.hash(pwd, 11, function(err, hash) {
                if (err) {
                    return res.status(500).send({msg: err});
                }
                let sql = `INSERT INTO user_table (first_name, last_name, contact_number, email_id, user_pwd, is_admin) VALUES ("${first_name}", "${last_name}", "${contact_number}", "${email_id}", "${hash}", "${is_admin}")`;
                connection.query(sql, (err, results) => {
                    if (err) return res.status(400).json({message: err});;
                    let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM user_table WHERE email_id = "${email_id}"`;
                    connection.query(sql, (err, results) => {
                        if (err) return res.status(400).json({message: err});;
                        return res.status(201).json({
                            "Response": results
                        });
                    });
                });
            });
        }
    });      

});

// login 
router.post('/users/login', (req, res) => {
    let email_id = req.body.email_id;
    let pwd = req.body.pwd;
    const key = process.env.key;
    if(email_id && pwd) {
        let sql = `SELECT * FROM user_table WHERE email_id = "${email_id}"`;
        connection.query(sql, (err, results) => {
            if (err) return res.status(400).json({message: err});
            if (results.length > 0) {
                // console.log(results[0].user_pwd);
                bcrypt.compare(pwd, results[0].user_pwd).then((status, err) => {
                    if(err) return res.status(500).json({message: err});
                    if(status) {
                        const jsonToken = jwt.sign({ result: results }, key, { expiresIn: "1h"} );
                        // console.log(jsonToken);
                        return res.status(200).json({message: 'Login Successful', token: jsonToken});
                    }else {
                        return res.status(401).json({message: "password does not match"});
                    }
                });
                
                
            }else {
                return res.status(401).json({message: 'Email does not exist'});
            }			
        });
    }else {
        return res.status(400).json({message: 'Please enter Email and Password!'});
    }
});

// get all user list
router.get('/users', checkToken, (req, res) => {
    let sql = `SELECT id,first_name,last_name,contact_number,email_id FROM user_table WHERE is_admin = 0`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({"response": results});
        }else {
            return res.status(204).json({message: 'Content not found'});
        }
    });
});
  
// get user by id
router.get('/users/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id,first_name,last_name,contact_number,email_id FROM user_table WHERE id = "${id}" AND is_admin = 0`;
    connection.query(sql, (err, results) => {
        if (err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({"response": results});
        }else {
          return res.status(404).json({message: "User with this Id not exist."});
        }
    });
});

// update user
router.put('/users/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email_id = req.body.email_id;
    let contact_number = req.body.contact_number;
    let pwd = req.body.pwd;

    let sql = `UPDATE user_table SET first_name = "${first_name}", last_name = "${last_name}", contact_number = "${contact_number}", email_id = "${email_id}", user_pwd = "${pwd}" WHERE id = "${id}" AND is_admin = 0`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM user_table WHERE id = "${id}"`;
            connection.query(sql, (err, results) => {
                if (err) return res.status(400).json({message: err});
                return res.status(202).json({
                    "Response": results
                });
            });
        }else {
            return res.status(404).json({message: 'user not found'});
        }
    });

});

// delete user
router.delete('/users/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM user_table WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) return res.status(400).json({message: err});
        if(result.length > 0) {
            let sql = `delete from user_table where id = "${id}"`;
            connection.query(sql, (err, results) => {
                if(err) return res.status(400).json({message: err});
                return res.status(202).json({
                    "Response": result
                });
            });
        }else {
            return res.status.json({message: "User with this id do not exist."});
        }
    }); 
});

// get all resources
router.get('/resources', (req, res) => {
    let sql = `SELECT * FROM resource_table`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({"response": results});
        }else {
            return res.status(204).json({message: 'No Content'});
        }
    });
});

// get resource by id
router.get('/resources/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, name, status FROM resource_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if (err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({"response": results});
        }else {
          return res.status(404).json({message: "User with this Id not exist."});
        }
    });
});


// create resource
router.post('/resources', (req, res) => {
    let name = req.body.name;
    let status = req.body.status;

    let q = `SELECT * FROM resource_table WHERE name = "${name}"`;
    connection.query(q, (err, data) => {
        if(err) return res.status(400).json({message: err});
        if(data.length > 0) {
            return res.status(409).json({message: "This resource alredy exist."});
        }else {
            let sql = `INSERT INTO resource_table (name, status) VALUES ("${name}", "${status}")`;
            connection.query(sql, (err, results) => {
                if (err) return res.status(400).json({message: err});
                let sql = `SELECT id, name, status FROM resource_table WHERE name = "${name}"`;
                connection.query(sql, (err, results) => {
                    if (err) return res.status(400).json({message: err});
                    return res.status(201).json({
                        "Response": results
                });
            });
        });
            }
    });
    
});

// update resource
router.put('/resources/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let status = req.body.status;

    let sql = `UPDATE resource_table SET name = "${name}", status = "${status}" WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) return res.status(400).json({message: err});
        if(result.length > 0) {
            let sql = `SELECT id, name, status FROM resource_table WHERE id = "${id}"`;
            connection.query(sql, (err, results) => {
                if (err) return res.status(400).json({message: err});
                return res.status(202).json({
                    "Response": results
                });
            });
        }else {
            return res.status(404).json({message: 'user not found'});
        }
        
        
    });
});


// delete resource
router.delete('/resources/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, name, status FROM resource_table WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) return res.status(400).json({message: err});
        if(result.length > 0) {
            let sql = `DELETE FROM resource_table WHERE id = "${id}"`;
            connection.query(sql, (err, results) => {
                if(err) return res.status(400).json({message: err});
                return res.status(202).json({
                    "Response": result
                });
            });
        }else {
            return res.status(404).json({message: "Resource with this id do not exist."});
        }
    });
    
});

// get all booking
router.get('/resbook', (req, res) => {
    let sql = `SELECT * FROM resource_occupation_table`;
    connection.query(sql, (err, results) => {
      if(err) return res.status(400).json({message: err});
      if(results.length > 0) {
        return res.status(200).json({
            "Response": results
            });
      }else {
        return res.status(204).json({message: 'No Content'});
      }
      
    });
});

// book resource
router.post('/resbook', (req, res) => {
    let resource_id = req.body.resource_id;
    let reserve_date = req.body.reserve_date;
    let user_id = req.body.user_id;

    let sql = `SELECT * FROM resource_occupation_table WHERE resource_id = "${resource_id}" AND reserve_date = "${reserve_date}"`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(409).json({message: "This resource for same date is already booked."});
        }else {
            let sql = `SELECT id FROM resource_table WHERE id = "${resource_id}" AND status = 1`;
            connection.query(sql, (err, resu) => {
                if (err) return res.status(400).json({message: err});
                if(resu.length > 0) {
                    let sql = `INSERT INTO resource_occupation_table (resource_id, reserve_date, user_id) VALUES ("${resource_id}", "${reserve_date}", "${user_id}")`;
                    connection.query(sql, (err, results) => {
                        if (err) return res.status(400).json({message: err});
                        let sql = `SELECT * FROM resource_occupation_table WHERE resource_id = "${resource_id}" AND reserve_date = "${reserve_date}"`;
                        connection.query(sql, (err, results) => {
                            if(err) return res.status(400).json({message: err});
                            return res.status(201).json({
                                "Response": results
                            });
                        });
                    });
                }else {
                    return res.status(409).json({message: 'resource is not open for booking.'});
                }
            });
            
        }
        
    });
});

// update booking
router.put('/resbook/:id', (req, res) => {
    let id = req.params.id;
    let resource_id = req.body.resource_id;
    let reserve_date = req.body.reserve_date;
    let user_id = req.body.user_id;

    let sql = `UPDATE resource_occupation_table SET resource_id = "${resource_id}", reserve_date = "${reserve_date}", user_id = "${user_id}" WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            let sql = `SELECT * FROM resource_occupation_table WHERE id = "${id}"`;
            connection.query(sql, (err, results) => {
                if(err) return res.status(400).json({message: err});
                return res.status(202).json({
                    "response": results
                });
            });
        }else {
            return res.status(404).json({message: 'user not found'});
        }
    });
});


// delete booking
router.delete('/resbook/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM resource_occupation_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            let sql = `DELETE FROM resource_occupation_table WHERE id = "${id}"`;
            connection.query(sql, (err, result) => {
                if(err) return res.status(400).json({message: err});
                return res.status(202).json({
                    "response": results
                });
            });
        }else {
            return res.status(404).json({message: "Resource with this date not booked."});
        }
    });
    
});

// get booking and user details by id
router.get('/resbook/:id', (req, res) => {
    let id = req.params.id;

    let sql = `SELECT * FROM resource_occupation_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        let val = JSON.stringify(results[0].user_id);
        let booking_details = results[0]; 
        if(results.length > 0) {
            let sql = `SELECT first_name,last_name,contact_number,email_id FROM user_table WHERE id = "${val}"`;
            connection.query(sql, (err, data) => {
                if(err) return res.status(400).json({message: err});
                let user_details = data[0];
                const combinedData = {
                    booking_details,
                    user_details
                  };
                
                return res.status(200).json({"response": combinedData});
            });
        }else {
            return res.status(404).json({message: "This resource either not present or it is not booked yet."});
        }
    });
});


module.exports = router;


