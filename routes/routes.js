const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const connection = require('../config/db');
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

    let q = `SELECT * FROM users_table WHERE email_id = "${email_id}" OR contact_number = "${contact_number}"`;

    connection.query(q, (err, data) => {
        if(err) return res.status(400).json({message: err});
        if(data.length > 0) {
            return res.status(409).send({message: "User with this email/contact number already exist."});
        }else {
            bcrypt.hash(pwd, 11, function(err, hash) {
                if (err) {
                    return res.status(500).send({msg: err});
                }
                let sql = `INSERT INTO users_table (first_name, last_name, contact_number, email_id, user_pwd, is_admin) VALUES ("${first_name}", "${last_name}", "${contact_number}", "${email_id}", "${hash}", "${is_admin}")`;
                connection.query(sql, (err, results) => {
                    if (err) return res.status(400).json({message: err});
                    
                    return res.status(201).json({
                        "first_name": req.body.first_name,
                        "last_name": req.body.last_name,
                        "contact_number": req.body.contact_number,
                        "email_id": req.body.email_id
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
        let sql = `SELECT id, email_id, user_pwd FROM users_table WHERE email_id = "${email_id}"`;
        connection.query(sql, (err, results) => {
            if (err) return res.status(400).json({message: err});
            if (results.length > 0) {
                // console.log(results[0].user_pwd);
                bcrypt.compare(pwd, results[0].user_pwd).then((status, err) => {
                    if(err) return res.status(500).json({message: err});
                    if(status) {
                        const jsonToken = jwt.sign({ result: results }, key, { expiresIn: "1h"} );
                        let currTime = (Date.now() + (1*60*60*1000));
                        let q = `UPDATE users_table SET token = "${jsonToken}", token_expiration =  "${currTime}" WHERE email_id = "${email_id}"`;
                        connection.query(q, (err, result) => {
                            if (err) return res.status(400).json({message: err});

                            return res.status(200).json({message: 'Login Successful', token: jsonToken, userId: results[0].id});
                        });
                        
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
    let sql = `SELECT id,first_name,last_name,contact_number,email_id FROM users_table WHERE is_admin = 0`;
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
    let sql = `SELECT id,first_name,last_name,contact_number,email_id FROM users_table WHERE id = "${id}" AND is_admin = 0`;
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

    let sql = `UPDATE users_table SET first_name = "${first_name}", last_name = "${last_name}", contact_number = "${contact_number}", email_id = "${email_id}"  WHERE id = "${id}" AND is_admin = 0`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.affectedRows) {
            return res.status(202).json({
                "id": req.params.id,
                "first_name": req.body.first_name,
                "last_name": req.body.last_name,
                "email_id": req.body.email_id,
                "contact_number": req.body.contact_number
            });
        }else {
            return res.status(404).json({message: 'user not found'});
        }
    });

});

// delete user
router.delete('/users/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM users_table WHERE id = "${id}"`;
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
            return res.status(404).json({message: "User with this id do not exist."});
        }
    }); 
});

// get all resources
router.get('/resources', checkToken, (req, res) => {
    let sql = `SELECT * FROM resources_table`;
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
router.get('/resources/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, name, status FROM resources_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if (err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({"response": results});
        }else {
          return res.status(404).json({message: "User with this Id not exist."});
        }
    });
});

//get resource by status
router.get('/resources/get/:status', checkToken, (req, res) => {
    let status = req.params.status;
    let val;
    if(status == 'active') {
        val = 1;
    }else {
        val = 0;
    }
    let sql = `SELECT id, name, status FROM resources_table WHERE status = "${val}"`;
    connection.query(sql, (err, results) => {
        if (err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({"response": results});
        }else {
          return res.status(404).json({message: `resource under "${status}" state is not available`});
        }
    });

});


// create resource
router.post('/resources', checkToken, (req, res) => {
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
                return res.status(201).json({
                    "name": req.body.name,
                    "status": req.body.status
                });
            });
        }
    });
    
});

// update resource
router.put('/resources/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let status = req.body.status;

    let sql = `UPDATE resource_table SET name = "${name}", status = "${status}" WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) return res.status(400).json({message: err});
        if(result.length > 0) {
            return res.status(202).json({
                "id": req.params.id,
                "name": req.body.name,
                "status": req.body.status
            });
            
        }else {
            return res.status(404).json({message: 'user not found'});
        }
        
        
    });
});


// delete resource
router.delete('/resources/:id', checkToken, (req, res) => {
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
router.get('/resbook', checkToken, (req, res) => {
    let sql = `SELECT * FROM resource_occupation_table`;
    connection.query(sql, (err, results) => {
      if(err) return res.status(400).json({message: err});
      if(results.length > 0) {
        return res.status(200).json({
            "response": results
            });
      }else {
        return res.status(204).json({message: 'No Content'});
      }
      
    });
});

// book resource
router.post('/resbook', checkToken, (req, res) => {
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
                        
                        return res.status(201).json({
                            "resource_id": req.body.resource_id,
                            "reserve_date": req.body.reserve_date,
                            "user_id": req.body.user_id
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
router.put('/resbook/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let resource_id = req.body.resource_id;
    let reserve_date = req.body.reserve_date;
    let user_id = req.body.user_id;

    let sql = `UPDATE resource_occupation_table SET resource_id = "${resource_id}", reserve_date = "${reserve_date}", user_id = "${user_id}" WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(202).json({
                "id": req.params.id,
                "resource_id": req.body.resource_id,
                "reserve_date": req.body.reserve_date,
                "user_id": req.body.user_id     
            });
        }else {
            return res.status(404).json({message: 'booking not found'});
        }
    });
});


// delete booking
router.delete('/resbook/:id', checkToken, (req, res) => {
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
router.get('/resbook/:id', checkToken, (req, res) => {
    let id = req.params.id;

    let sql = `SELECT o.id, o.reserve_date, o.resource_id, o.user_id,
                r.name,
                u.first_name, u.last_name, u.contact_number, u.email_id
                FROM resource_occupation_table o
                INNER JOIN resource_table r
                    on o.resource_id = r.id
                INNER JOIN user_table u
                    on o.user_id = u.id
                WHERE o.id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) return res.status(400).json({message: err});
        if(results.length > 0) {
            return res.status(200).json({response: {
                booking_details: {
                    booking_id: results[0].id,
                    booking_date: results[0].reserve_date,
                    resource_id: results[0].resource_id,
                    user_id: results[0].user_id
                },
                resource_details: {
                    resource_name: results[0].name
                },
                user_details: {
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    contact_number: results[0].contact_number,
                    email_id: results[0].email_id
                }
            }});
        }else {
            return res.status(404).json({message: "This resource either not present or it is not booked yet."});
        }
    });
});

// check for valid token
router.get('/tokenCheck', checkToken, (req, res) => {
    return res.status(200).json({status: 200, message: "valid user"});
});



module.exports = router;


