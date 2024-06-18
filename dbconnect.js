const {Pool} = require('pg')

const pool = new Pool({
    connectionString: 'postgres://sandrodv:KbchegyrTxBEW8SOGRRpPT7ycoIKzfxb@dpg-cpoh65uehbks73ej5h20-a/devpage_db',
    ssl:{
        rejectUnauthorized: false
    }
});

module.exports.Create = ()=>{
    const q = "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(100) UNIQUE, public BIT NOT NULL, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
    pool.query(q, (err, res)=>{
        if(err){
            return({err: err});
        }else{
            return({rows: res.rows});
        }
    });
}

module.exports.SignUp = (data)=>{
    const q = "INSERT INTO users (name, email, public) VALUES ($1, $2, $3) RETURNING *;";
    pool.query(q, data, (err, res)=>{
        if(err){
            return({err: err});
        }else{
            return({rows: res.rows});
        }
    });
}