const {Pool} = require('pg')

const pool = new Pool({
    connectionString: 'postgres://sandrodv:KbchegyrTxBEW8SOGRRpPT7ycoIKzfxb@dpg-cpoh65uehbks73ej5h20-a/devpage_db',
    ssl:{
        rejectUnauthorized: false
    }
});

module.exports.Create = ()=>{
    const q = "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL);";
    const result = pool.query(q, (err, res)=>{
        if(err)
            console.log(err);
        else
            console.log(res.rows);
    });
}

module.exports.SignIn = async()=>{
    const result = await pool.query("INSERT into");
    console.log(result.rows);
}