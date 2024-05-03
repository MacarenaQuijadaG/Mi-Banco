const { Pool } = require("pg");

const config = {
    host: "localhost",
    database: "banco",
    user: "postgres",
    password: "desarrollo",
    port: 5432,
};

const pool = new Pool(config);

async function nuevaTransferencia(descripcion, fecha, monto, cuenta_origen, cuenta_destino) {
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
        console.error("Error en la transacción SQL:", error);
        throw error; 
    }
}

async function registrosDeTransferencias(cuentaId) {
    try {
        const query = "SELECT * FROM transferencias WHERE cuenta_origen = $1 OR cuenta_destino = $1 ORDER BY fecha DESC LIMIT 10";
        const result = await pool.query(query, [cuentaId]);
        return result.rows;
    } catch (error) {
        console.error("Error al consultar los últimos registros de transferencias:", error);
        throw error;
    }
}

async function consultarSaldo(cuentaId) {
    try {
        const query = "SELECT saldo FROM cuentas WHERE id = $1";
        const result = await pool.query(query, [cuentaId]);
        return result.rows[0].saldo;
    } catch (error) {
        console.error("Error al consultar el saldo:", error);
        throw error;
    }
}

(async () => {
    
    const argumentos = process.argv.slice(2);
    const funcion = argumentos[0];
    const descripcion = argumentos[1];
    const fecha = argumentos[2];
    const monto = argumentos[3];
    const cuenta_origen = argumentos[4];
    const cuenta_destino = argumentos[5];

    if (funcion === "transferencia") {
        await nuevaTransferencia(descripcion, fecha, monto, cuenta_origen, cuenta_destino);
    } else if (funcion === "movimientos") {
        const id = argumentos[6];
        await registrosDeTransferencias(id);
    } else if (funcion === "consulta") {
        const id = argumentos[6];
        await consultarSaldo(id);
    } else {
        console.log("La función invocada '" + funcion + "' no es válida.");
    }
    pool.end();
})();

/*datos de prueba
node serverExpress transferencia "Pago de mensualidad" "02/05/2024" 10000 1 2
node serverExpress transferencia "Pago de mensualidad" 5000 1 2 
*/