const {Pool} = require ("pg");

const config = {
    host: "localhost",
    database: "banco",
    user: "postgres",
    password : "desarrollo",
    port: 5433
}

const pool = new Pool(config);

const argumentos = process.argv.slice(20)

const funcion = argumentos[0];
const descripcion = argumentos [1];
const fecha = argumentos [2];
const monto =argumentos [3];
const cuenta_origen = argumentos [4];
const cuenta_destino = argumentos [5];


const transferencia = async ({descripcion, fecha, monto, cuenta_origen, cuenta_destino}) => {

    await pool.query("BEGIN");
    const resta = "UPDATE INTO cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *";
    const res1 = await pool.query(resta,[monto, cuenta_origen]);
    console.log("Operacion de descuento exitosa:" ,res1.rows[0]);

    const suma = "UPDATE INTO cuentas SET saldo = saldo - $1 WHERE id = $3 RETURNING *";
    const res2 = await pool.query(suma,[monto, cuenta_destino]);
    console.log("Operacion de descuento exitosa:" ,res2.rows[0]);

    const transferencia = "INSERT INTO transferencias(descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES($1, $2, $3 $4, $5) RETURNING*";
    const res3 = await pool.query(transferencia,[descripcion, fecha, monto, cuenta_origen, cuenta_destino]);
    console.log("Operación de descuento exitosa:" ,res3.rows[0]);

    await pool.query("COMMIT");
}

const funciones ={
    transferencia : transferencia,
    movimientos: movimientos,
    consulta: consulta
}

const arreglo = Object.keys(funciones);

(async () => {
    (arreglo.includes(funcion) == true)
    ? await funciones[funcion]({})
    : console.log("la funcion invocada"+ funcion + "no es valida")
    pool.end()

})