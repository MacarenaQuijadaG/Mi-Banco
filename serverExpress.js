const { Pool } = require("pg");

const config = {
    host: "localhost",
    database: "banco",
    user: "postgres",
    password: "desarrollo",
    port: 5432,
}

const pool = new Pool(config);

const transferencia = async ({ descripcion, fecha, monto, cuenta_origen, cuenta_destino }) => {
    try {
        await pool.query("BEGIN");

        const resta = "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *";
        const res1 = await pool.query(resta, [monto, cuenta_origen]);
        console.log("Operación de descuento exitosa: ", res1.rows[0]);
    
        const suma = "UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2 RETURNING *";
        const res2 = await pool.query(suma, [monto, cuenta_destino]);
        console.log("Operación de acreditación exitosa: ", res2.rows[0]);
    
        const transferenciaQuery = "INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES($1, $2, $3, $4, $5) RETURNING *";
        const res3 = await pool.query(transferenciaQuery, [descripcion, fecha, monto, cuenta_origen, cuenta_destino]);
        console.log("Operación de transferencia exitosa: ", res3.rows[0]);
    
        await pool.query("COMMIT");
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error durante la transferencia:", error);
    }
}

const movimientos = async (id) => {
    try {
        const query = "SELECT * FROM transferencias WHERE cuenta_origen = $1 OR cuenta_destino = $1";
        const res = await pool.query(query, [id]);
        console.log("Movimientos:");
        console.log(res.rows);
    } catch (error) {
        console.error("Error al consultar movimientos:", error);
    }
}

const consulta = async (id) => {
    try {
        const query = "SELECT * FROM cuentas WHERE id = $1";
        const res = await pool.query(query, [id]);
        console.log("Consulta:");
        console.log(res.rows[0]);
    } catch (error) {
        console.error("Error al consultar cuenta:", error);
    }
}

const args = process.argv.slice(2);
const command = args.shift(); 

// funcion correpondiente
if (command === 'transferencia') {
    const [descripcion, fecha, monto, cuenta_origen, cuenta_destino] = args;
    transferencia({ descripcion, fecha, monto, cuenta_origen, cuenta_destino });
} else if (command === 'movimientos') {
    const id = args[0];
    movimientos(id);
} else if (command === 'consulta') {
    const id = args[0];
    consulta(id);
} else {
    console.error("Comando no reconocido");
}


/*datos de prueba

node serverExpress.js transferencia "Pago de mensualidad" 5000 1 2 
node serverExpress.js consulta 2
node serverExpress.js movimientos 2
*/

