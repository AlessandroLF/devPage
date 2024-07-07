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
            const q = "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(60) NOT NULL UNIQUE, quote VARCHAR(150), email VARCHAR(60), password VARCHAR(100) NOT NULL, public BIT NOT NULL, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
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
    const q = "INSERT INTO users (name, email, password, public) VALUES ($1, $2, $3, $4) RETURNING id;";
    try{
        const res = await pool.query(q, [data.name, data.email, data.password, data.public ? 1 : 0]);
        if(res.rowCount)
            return({suc: true});
        else
            console.log('Unexpected response not error', res);
    }catch(e){
        const detail = e.detail;
        console.log('err detail:', detail);
        const key = detail.split('(')[1].split(')')[0];
        const val = detail.split('(')[2].split(')')[0];
        return({err: 'Duplicate account', key: key, val: val});
    }
}

module.exports.LogIn = async(data)=>{
    try{
        const res = await pool.query('SELECT name, password FROM users WHERE name=$1;', [data.name]);
        const user = res.rows[0];
        console.log('User fetched: ', user)
        const match = await argon2.verify(user.password, data.password);
        if(match)
            return({suc: true});
        else
            return({err: "Invalid credentials"});
    }catch(err){
        console.log('Error buscando usuario: ', err);
        return({err: 'Invalid credentials'});
    }
}

module.exports.Get = async(data)=>{
    const cols = data.cols.join(', ');
    let q = 'SELECT ' + cols + " FROM users WHERE public=B'1'";
    let params = [];
    if(data.condition){
        q += ' AND ' + data.condition + '=$3';
        params.push(data.value);
    }
    try{
        const res = await pool.query(q, params);
        if(res.rowCount > 0){
            return({rows: res.rows});
        }else{
            return({err: 'No results'});
        }
    }catch(err){
        console.log('Error at get: ', err)
        return({err: 'Database error'});
    }
    
}

module.exports.getQuotes = async(data)=>{

    const res = await this.LogIn(data)
    if(!res.err){
        const q = "SELECT users.quotes FROM users where name=$1";
        try{
            const res = await pool.query(q, [data.namme]);
            if(res.rowCount)
                return({suc: true});
            else
                console.log('Unexpected response not error', res);
        }catch(e){
            console.log('err detail:', e);
            return({err: 'Fatabase error'});
        }
    }else{
        return(res);
    }
}

module.exports.saveQuote = async(data)=>{

    const res = await this.LogIn(data)
    if(!res.err){
        const q = "UPDATE users SET quote=$1 where name=$2;";
        try{
            const res = await pool.query(q, [data.quote, data.name]);
            if(res.rowCount > 0)
                return({rows: res.rows});
            else{
                console.log('Unexpected response not error', res);
                return ({res: 'No results'});
            }
        }catch(e){
            console.log('err detail:', e);
            return({err: "Unexpected error, we've been notiicated"});
        }
    }else{
        return(res);
    }
}