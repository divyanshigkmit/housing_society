const { json } = require('body-parser');
const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.post('/login', (req, res) => {
    let email_id = req.body.email_id;
    let pwd = req.body.pwd;
    if(email_id && pwd) {
        let sql = `SELECT * FROM user_table WHERE email_id = "${email_id}" AND user_pwd = "${pwd}"`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.send('Login Successful');
            }else {
                res.send('Incorrect Username and/or Password!');
            }			
        });
    }else {
        res.send('Please enter Username and Password!');
    }
});

router.get('/users',(req, res) => {
    let sql = `SELECT id,first_name,last_name,contact_number,email_id FROM user_table WHERE is_admin = 0`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        res.send(JSON.stringify({"response": results}));
    });
});
  
//   router.get('/users',(req, res) => {
//     let sql = "SELECT id,first_name,last_name,contact_number,email_id FROM user_table WHERE is_admin = 1";
//     let query = connection.query(sql, (err, results) => {
//       if(err) throw err;
//       res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
//     });
//   });
  
router.get('/users/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id,first_name,last_name,contact_number,email_id FROM user_table WHERE id = "${id}" AND is_admin = 0`;
    connection.query(sql, (err, results) => {
        if (err) throw err;
        if(results.length > 0) {
            res.send(JSON.stringify({"response": results}));
        }else {
          res.send("User with this Id not exist.");
        }
    });
});


router.post('/users', (req, res) => {
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email_id = req.body.email_id;
    let contact_number = req.body.contact_number;
    let pwd = req.body.pwd;

    let q = `SELECT * FROM user_table WHERE email_id = "${email_id}" OR contact_number = "${contact_number}"`;

    connection.query(q, (err, data) => {
        if(err) throw err;
        if(data.length > 0) {
            res.send("User with this email Id/contact number already exist.");
        }else {
            let sql = `INSERT INTO user_table (first_name, last_name, contact_number, email_id, user_pwd) VALUES ("${first_name}", "${last_name}", "${contact_number}", "${email_id}", "${pwd}")`;
            connection.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM user_table WHERE email_id = "${email_id}"`;
                connection.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send(JSON.stringify({
                        "Response": results
                    }));
                });
            });
        }
    });       
});

router.put('/users/:id', (req, res) => {
    let id = req.params.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email_id = req.body.email_id;
    let contact_number = req.body.contact_number;
    let pwd = req.body.pwd;

    let sql = `UPDATE user_table SET first_name = "${first_name}", last_name = "${last_name}", contact_number = "${contact_number}", email_id = "${email_id}", user_pwd = "${pwd}" WHERE id = "${id}" AND is_admin = 0`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM user_table WHERE id = "${id}"`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            res.send(JSON.stringify({
                "Response": results
            }));
        });
    });

});

router.delete('/users/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, first_name, last_name, contact_number, email_id FROM user_table WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
            let sql = `delete from user_table where id = "${id}"`;
            connection.query(sql, (err, results) => {
                if(err) throw err;
                res.send(JSON.stringify({
                    "Response": result
                }));
            });
        }else {
            res.send("User with this id do not exist.");
        }
    }); 
});

router.get('/resources', (req, res) => {
    let sql = `SELECT * FROM resource_table`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        res.send(JSON.stringify({"response": results}));
    });
});

router.get('/resources/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, name, status FROM resource_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if (err) throw err;
        if(results.length > 0) {
            res.send(JSON.stringify({"response": results}));
        }else {
          res.send("User with this Id not exist.");
        }
    });
});

router.post('/resources', (req, res) => {
    let name = req.body.name;
    let status = req.body.status;

    let q = `SELECT * FROM resource_table WHERE name = "${name}"`;
    connection.query(q, (err, data) => {
        if(err) throw err;
        if(data.length > 0) {
            res.send("This resource alredy exist.");
        }else {
            let sql = `INSERT INTO resource_table (name, status) VALUES ("${name}", "${status}")`;
            connection.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `SELECT id, name, status FROM resource_table WHERE name = "${name}"`;
                connection.query(sql, (err, results) => {
                    if (err) throw err;
                    res.send(JSON.stringify({
                        "Response": results
                }));
            });
        });
            }
    });
    
});

router.put('/resources/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let status = req.body.status;

    let sql = `UPDATE resource_table SET name = "${name}", status = "${status}" WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) throw err;
        let sql = `SELECT id, name, status FROM resource_table WHERE id = "${id}"`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            res.send(JSON.stringify({
                "Response": results
            }));
        });
        
    });
});

router.delete('/resources/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT id, name, status FROM resource_table WHERE id = "${id}"`;
    connection.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
            let sql = `DELETE FROM resource_table WHERE id = "${id}"`;
            connection.query(sql, (err, results) => {
                if(err) throw err;
                res.send(JSON.stringify({
                    "Response": result
                }));
            });
        }else {
            res.send("Resource with this id do not exist.");
        }
    });
    
});

router.get('/resbook', (req, res) => {
    let sql = `SELECT * FROM resource_occupation_table`;
    connection.query(sql, (err, results) => {
      if(err) throw err;
      res.send(JSON.stringify({
        "Response": results
        }));
    });
});

router.post('/resbook', (req, res) => {
    let resource_id = req.body.resource_id;
    let reserve_date = req.body.reserve_date;
    let user_id = req.body.user_id;

    let sql = `SELECT * FROM resource_occupation_table WHERE resource_id = "${resource_id}" AND reserve_date = "${reserve_date}"`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
            res.send("This resource for same date is already booked.")
        }else {
            let sql = `INSERT INTO resource_occupation_table (resource_id, reserve_date, user_id) VALUES ("${resource_id}", "${reserve_date}", "${user_id}")`;
            connection.query(sql, (err, results) => {
                if (err) throw err;
                let sql = `SELECT * FROM resource_occupation_table WHERE resource_id = "${resource_id}" AND reserve_date = "${reserve_date}"`;
                connection.query(sql, (err, results) => {
                    if(err) throw err;
                    res.send(JSON.stringify({
                        "Response": results
                    }));
                });
            });
        }
        
    });
});

router.put('/resbook/:id', (req, res) => {
    let id = req.params.id;
    let resource_id = req.body.resource_id;
    let reserve_date = req.body.reserve_date;
    let user_id = req.body.user_id;

    let sql = `UPDATE resource_occupation_table SET resource_id = "${resource_id}", reserve_date = "${reserve_date}", user_id = "${user_id}" WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        let sql = `SELECT * FROM resource_occupation_table WHERE id = "${id}"`;
        connection.query(sql, (err, results) => {
            if(err) throw err;
            res.send(JSON.stringify({
                "response": results
            }));
        });
    });
});

router.delete('/resbook/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM resource_occupation_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        if(results.length > 0) {
            let sql = `DELETE FROM resource_occupation_table WHERE id = "${id}"`;
            connection.query(sql, (err, result) => {
                if(err) throw err;
                res.send(JSON.stringify({
                    "response": results
                }));
            });
        }else {
            res.send("Resource with this date not booked.");
        }
    });
    
});

router.get('/resbook/:id', (req, res) => {
    let id = req.params.id;

    let sql = `SELECT * FROM resource_occupation_table WHERE id = "${id}"`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        let val = JSON.stringify(results[0].user_id);
        let booking_details = results[0]; 
        if(results.length > 0) {
            let sql = `SELECT first_name,last_name,contact_number,email_id FROM user_table WHERE id = "${val}"`;
            connection.query(sql, (err, data) => {
                if(err) throw err;
                let user_details = data[0];
                const combinedData = {
                    booking_details,
                    user_details
                  };
                // console.log(combinedData);
                res.send(JSON.stringify({"response": combinedData}));
            });
        }else {
            res.send("This resource either not present or it is not booked yet.");
        }
    });
});


module.exports = router;


