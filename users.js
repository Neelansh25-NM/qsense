console.log("Users route file loaded.");
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
router.post('/', async (req, res) => {
    const { name,email,phone,password,is_guest} = req.body;

    try{
        const hashedPassword  = await bcrypt.hash(password,10);
        const [result] = await db.query(
            'insert into customer (name,email, phone,password, is_guest) values (?, ?, ?, ?, 0)', [name,email,phone,hashedPassword]
        );

        res.json({
            message : 'the user has been created!!',
            customer_id : result.insertId
        });
    }
    catch (error){
        res.status(500).json({error : error.message});
    }
});

router.post('/login', async (req,res)=>{

    const {email,password} = req.body;

    const [rows] = await db.query(
        "SELECT * FROM customer WHERE email = ?",
        [email]
    );

    if(rows.length === 0){
        return res.status(401).json({message:"Invalid credentials"});
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password,user.password);

    if(!valid){
        return res.status(401).json({message:"Invalid credentials"});
    }

    res.json({
        message:"Login successful",
        user:user.customer_id
    });

});

router.post('/register', async (req, res) => {

    const { name, email, phone, password, } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO customer (name, email, phone, password, is_guest)
             VALUES (?, ?, ?, ?, 0)`,
            [name, email, phone, hashedPassword]
        );

        res.json({
            message: "Customer registered successfully",
            customer_id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

router.get('/:id', async (req,res)=>{

    const id = req.params.id;

    try{

        const [rows] = await db.query(
            "SELECT name FROM customer WHERE customer_id = ?",
            [id]
        );

        if(rows.length === 0){
            return res.status(404).json({message:"User not found"});
        }

        res.json(rows[0]);

    }
    catch(error){
        res.status(500).json({error:error.message});
    }

});


module.exports  = router;
