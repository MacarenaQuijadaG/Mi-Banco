CREATE DATABASE banco;

\c banco

CREATE TABLE transferencias(
    id SERIAL PRIMARY KEY,
    descripcion varchar(50),
    fecha varchar (10),
    monto DECIMAL,
    cuenta_origen INT,
    cuenta_destino INT,
    FOREIGN KEY (cuenta_origen) REFERENCES cuentas(id),
    FOREIGN KEY (cuenta_destino) REFERENCES cuentas(id)
);

CREATE TABLE cuentas(
    id INT PRIMARY KEY,
    saldo DECIMAL CHECK (saldo >= 0)
);

INSERT INTO cuentas VALUES (1,20000);
INSERT INTO cuentas VALUES (2,10000);