import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "My1stDatabase",
    password: "Archanachauhan@123",
    port: 5432
});

db.connect();

// Update this route to fetch the data each time it's accessed
app.get("/", (req, res) => {
    db.query("SELECT * FROM srmstd", (err, result) => {
        if (err) {
            console.error("Error fetching students", err.stack);
            res.status(500).send("Error fetching students");
        } else {
            res.render('index', { list: result.rows });
        }
    });
});

app.get("/select", (req, res) => {
    res.render('select');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/select", (req, res) => {
    const { name, skill1, skill2, skill3 } = req.body;

    let query = "SELECT * FROM srmstd WHERE 1=1";
    let queryParams = [];

    if (name) {
        query += " AND name = $1";
        queryParams.push(name);
    }

    const skillConditions = [];
    if (skill1) {
        skillConditions.push(`$${queryParams.length + 1}`);
        queryParams.push(skill1);
    }

    if (skill2) {
        skillConditions.push(`$${queryParams.length + 1}`);
        queryParams.push(skill2);
    }

    if (skill3) {
        skillConditions.push(`$${queryParams.length + 1}`);
        queryParams.push(skill3);
    }

    if (skillConditions.length > 0) {
        query += ` AND (${skillConditions.map(cond => `(skill1 = ${cond} OR skill2 = ${cond} OR skill3 = ${cond})`).join(' OR ')})`;
    }

    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Error executing query");
        } else {
            res.render('select', { students: result.rows });
        }
    });
});

app.post("/register", (req, res) => {
    var { name, department, course, skill1, skill2, skill3 } = req.body;
    var query = `INSERT INTO srmstd (name, department, course, skill1, skill2, skill3)
    VALUES ($1, $2, $3, $4, $5, $6)`;
    db.query(query, [name, department, course, skill1, skill2, skill3], (err) => {
        if (err) {
            console.log("Error while querying!");
            res.status(500).send("Error while querying!");
        } else {
            res.redirect('/');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
