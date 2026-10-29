-- 01_tablas.sql: tablas base del inventario TecnoStock (Usuario, Categoria, Producto, Movimiento)
-- con PK, FK sin CASCADE, UNIQUE, CHECK, DEFAULTs e indices recomendados. Idempotente.

IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        id INT IDENTITY(1,1) NOT NULL,
        username NVARCHAR(50) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        nombre_completo NVARCHAR(100) NOT NULL,
        activo BIT NOT NULL CONSTRAINT DF_Usuario_activo DEFAULT (1),
        fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT DF_Usuario_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Usuario PRIMARY KEY (id),
        CONSTRAINT UQ_Usuario_username UNIQUE (username)
    );
END
GO

IF OBJECT_ID(N'dbo.Categoria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categoria (
        id INT IDENTITY(1,1) NOT NULL,
        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(255) NULL,
        fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT DF_Categoria_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Categoria PRIMARY KEY (id),
        CONSTRAINT UQ_Categoria_nombre UNIQUE (nombre)
    );
END
GO

IF OBJECT_ID(N'dbo.Producto', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Producto (
        id INT IDENTITY(1,1) NOT NULL,
        codigo NVARCHAR(30) NOT NULL,
        nombre NVARCHAR(150) NOT NULL,
        descripcion NVARCHAR(500) NULL,
        categoria_id INT NOT NULL,
        precio_compra DECIMAL(12,2) NOT NULL,
        precio_venta DECIMAL(12,2) NOT NULL,
        stock_actual INT NOT NULL CONSTRAINT DF_Producto_stock_actual DEFAULT (0),
        stock_minimo INT NOT NULL CONSTRAINT DF_Producto_stock_minimo DEFAULT (0),
        activo BIT NOT NULL CONSTRAINT DF_Producto_activo DEFAULT (1),
        fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT DF_Producto_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        fecha_actualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_Producto_fecha_actualizacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Producto PRIMARY KEY (id),
        CONSTRAINT UQ_Producto_codigo UNIQUE (codigo),
        CONSTRAINT FK_Producto_Categoria FOREIGN KEY (categoria_id) REFERENCES dbo.Categoria (id),
        CONSTRAINT CK_Producto_precio_compra CHECK (precio_compra > 0),
        CONSTRAINT CK_Producto_precio_venta CHECK (precio_venta > 0),
        CONSTRAINT CK_Producto_stock_actual CHECK (stock_actual >= 0),
        CONSTRAINT CK_Producto_stock_minimo CHECK (stock_minimo >= 0)
    );
END
GO

IF OBJECT_ID(N'dbo.Movimiento', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Movimiento (
        id BIGINT IDENTITY(1,1) NOT NULL,
        producto_id INT NOT NULL,
        tipo VARCHAR(7) NOT NULL,
        cantidad INT NOT NULL,
        fecha DATETIME2(0) NOT NULL,
        motivo NVARCHAR(255) NOT NULL,
        stock_anterior INT NOT NULL,
        stock_posterior INT NOT NULL,
        usuario_id INT NULL,
        fecha_registro DATETIME2(0) NOT NULL CONSTRAINT DF_Movimiento_fecha_registro DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Movimiento PRIMARY KEY (id),
        CONSTRAINT FK_Movimiento_Producto FOREIGN KEY (producto_id) REFERENCES dbo.Producto (id),
        CONSTRAINT FK_Movimiento_Usuario FOREIGN KEY (usuario_id) REFERENCES dbo.Usuario (id),
        CONSTRAINT CK_Movimiento_tipo CHECK (tipo IN (N'ENTRADA', N'SALIDA')),
        CONSTRAINT CK_Movimiento_cantidad CHECK (cantidad > 0),
        CONSTRAINT CK_Movimiento_coherencia CHECK (
            (tipo = N'ENTRADA' AND stock_posterior = stock_anterior + cantidad)
            OR (tipo = N'SALIDA' AND stock_posterior = stock_anterior - cantidad)
        )
    );
END
GO

-- Indices recomendados (idempotentes)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Movimiento_producto_id_fecha' AND object_id = OBJECT_ID(N'dbo.Movimiento'))
    CREATE INDEX IX_Movimiento_producto_id_fecha ON dbo.Movimiento (producto_id, fecha);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Movimiento_fecha' AND object_id = OBJECT_ID(N'dbo.Movimiento'))
    CREATE INDEX IX_Movimiento_fecha ON dbo.Movimiento (fecha);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Producto_categoria_id' AND object_id = OBJECT_ID(N'dbo.Producto'))
    CREATE INDEX IX_Producto_categoria_id ON dbo.Producto (categoria_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Producto_nombre' AND object_id = OBJECT_ID(N'dbo.Producto'))
    CREATE INDEX IX_Producto_nombre ON dbo.Producto (nombre);
GO
