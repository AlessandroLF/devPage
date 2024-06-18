const {Pool} = require('pg');
const argon2 = require('argon2');

const pool = new Pool({
    connectionString: 'postgres://sandrodv:KbchegyrTxBEW8SOGRRpPT7ycoIKzfxb@dpg-cpoh65uehbks73ej5h20-a/devpage_db',
    ssl:{
        rejectUnauthorized: false
    }
});

module.exports.Create = ()=>{
    pool.query("DROP TABLE users", (err)=>{
        if(!err){
            const q = "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(60) NOT NULL UNIQUE, email VARCHAR(60) UNIQUE, password VARCHAR(100) NOT NULL, public BIT NOT NULL, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
            pool.query(q, (err, res)=>{
                if(err){
                    return({err: err});
                }else{
                    console.log("Success!! " + res);
                    return({suc: res});
                }
            });
        }else{
            console.log("Error doping table: " + err);
            return({err: err});
        }
    });
}

module.exports.SignUp = async(data)=>{
    data.password = await argon2.hash(data.password);
    const q = "INSERT INTO users (name, email, password, public) VALUES ($1, $2, $3, $4) RETURNING *;";
    pool.query(q, [data.name, data.email, data.password, data.pubilc], (err, res)=>{
        if(err){
            return({err: err});
        }else{
            return({rows: res.rows});
        }
    });
}

module.exports.LogIn = async(data)=>{
    const res = pool.query('SELECT password FROM users WHERE name=$1;', [data.name]);
    const user = res.rows[0];
    const match = await argon2.verify(user.passw, data.passw);
    if(match)
        return({suc: true});
    else
        return({err: "Invalid credentials"});
}

module.exports.Get = (data)=>{
    const cols = data.cols.join(', ');
    let q = 'SELECT ${columns} FROM users WHERE ${condition}=${value}';
    pool.query(q, {columns: data.columns, condition: data.condition, value: data.value}, (err, res)=>{
        if(err){
            return({err: err});
        }else{
            return({rows: res.rows});
        }
    });
}