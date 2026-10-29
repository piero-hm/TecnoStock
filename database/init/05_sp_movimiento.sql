-- 05_sp_movimiento.sql: registrar entradas/salidas con transaccion y UPDLOCK, y listar movimientos.

-- Registra una entrada de stock. Actualiza Producto y crea Movimiento de forma atomica.
CREATE OR ALTER PROCEDURE dbo.usp_Movimiento_RegistrarEntrada
    @producto_id INT,
    @cantidad INT,
    @fecha DATETIME2(0),
    @motivo NVARCHAR(255),
    @usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validaciones previas a la transaccion
    IF @cantidad IS NULL OR @cantidad <= 0
    BEGIN
        THROW 50040, N'CANTIDAD_INVALIDA|La cantidad debe ser mayor a 0.', 1;
    END

    IF @motivo IS NULL OR LTRIM(RTRIM(@motivo)) = N''
    BEGIN
        THROW 50043, N'MOTIVO_REQUERIDO|El motivo es obligatorio.', 1;
    END

    IF @fecha IS NULL
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|La fecha es obligatoria.', 1;
    END

    SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @stock_anterior INT;
        DECLARE @activo BIT;
        DECLARE @encontrado BIT = 0;
        DECLARE @codigo NVARCHAR(30);
        DECLARE @nombre NVARCHAR(150);

        SELECT @stock_anterior = stock_actual,
               @activo = activo,
               @codigo = codigo,
               @nombre = nombre,
               @encontrado = 1
        FROM dbo.Producto WITH (UPDLOCK, ROWLOCK)
        WHERE id = @producto_id;

        IF @encontrado = 0
        BEGIN
            THROW 50031, N'PRODUCTO_NO_ENCONTRADO|Producto no encontrado.', 1;
        END

        IF @activo = 0
        BEGIN
            THROW 50032, N'PRODUCTO_INACTIVO|El producto esta inactivo.', 1;
        END

        DECLARE @stock_posterior INT = @stock_anterior + @cantidad;

        UPDATE dbo.Producto
        SET stock_actual = @stock_posterior,
            fecha_actualizacion = SYSUTCDATETIME()
        WHERE id = @producto_id;

        DECLARE @mov_id BIGINT;
        INSERT INTO dbo.Movimiento (producto_id, tipo, cantidad, fecha, motivo, stock_anterior, stock_posterior, usuario_id)
        VALUES (@producto_id, N'ENTRADA', @cantidad, @fecha, @motivo, @stock_anterior, @stock_posterior, @usuario_id);
        SET @mov_id = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT m.id, m.producto_id, p.codigo AS producto_codigo, p.nombre AS producto_nombre,
               m.tipo, m.cantidad, m.fecha, m.motivo, m.stock_anterior, m.stock_posterior,
               u.username AS usuario_username, m.fecha_registro
        FROM dbo.Movimiento m
        JOIN dbo.Producto p ON p.id = m.producto_id
        LEFT JOIN dbo.Usuario u ON u.id = m.usuario_id
        WHERE m.id = @mov_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Registra una salida de stock. Falla si no hay stock suficiente.
CREATE OR ALTER PROCEDURE dbo.usp_Movimiento_RegistrarSalida
    @producto_id INT,
    @cantidad INT,
    @fecha DATETIME2(0),
    @motivo NVARCHAR(255),
    @usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @cantidad IS NULL OR @cantidad <= 0
    BEGIN
        THROW 50040, N'CANTIDAD_INVALIDA|La cantidad debe ser mayor a 0.', 1;
    END

    IF @motivo IS NULL OR LTRIM(RTRIM(@motivo)) = N''
    BEGIN
        THROW 50043, N'MOTIVO_REQUERIDO|El motivo es obligatorio.', 1;
    END

    IF @fecha IS NULL
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|La fecha es obligatoria.', 1;
    END

    SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @stock_anterior INT;
        DECLARE @activo BIT;
        DECLARE @encontrado BIT = 0;
        DECLARE @codigo NVARCHAR(30);
        DECLARE @nombre NVARCHAR(150);

        SELECT @stock_anterior = stock_actual,
               @activo = activo,
               @codigo = codigo,
               @nombre = nombre,
               @encontrado = 1
        FROM dbo.Producto WITH (UPDLOCK, ROWLOCK)
        WHERE id = @producto_id;

        IF @encontrado = 0
        BEGIN
            THROW 50031, N'PRODUCTO_NO_ENCONTRADO|Producto no encontrado.', 1;
        END

        IF @activo = 0
        BEGIN
            THROW 50032, N'PRODUCTO_INACTIVO|El producto esta inactivo.', 1;
        END

        IF @stock_anterior < @cantidad
        BEGIN
            DECLARE @msg NVARCHAR(255) = N'STOCK_INSUFICIENTE|Stock insuficiente: disponible ' + CAST(@stock_anterior AS NVARCHAR(20)) + N', solicitado ' + CAST(@cantidad AS NVARCHAR(20)) + N'.';
            THROW 50041, @msg, 1;
        END

        DECLARE @stock_posterior INT = @stock_anterior - @cantidad;

        UPDATE dbo.Producto
        SET stock_actual = @stock_posterior,
            fecha_actualizacion = SYSUTCDATETIME()
        WHERE id = @producto_id;

        DECLARE @mov_id BIGINT;
        INSERT INTO dbo.Movimiento (producto_id, tipo, cantidad, fecha, motivo, stock_anterior, stock_posterior, usuario_id)
        VALUES (@producto_id, N'SALIDA', @cantidad, @fecha, @motivo, @stock_anterior, @stock_posterior, @usuario_id);
        SET @mov_id = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT m.id, m.producto_id, p.codigo AS producto_codigo, p.nombre AS producto_nombre,
               m.tipo, m.cantidad, m.fecha, m.motivo, m.stock_anterior, m.stock_posterior,
               u.username AS usuario_username, m.fecha_registro
        FROM dbo.Movimiento m
        JOIN dbo.Producto p ON p.id = m.producto_id
        LEFT JOIN dbo.Usuario u ON u.id = m.usuario_id
        WHERE m.id = @mov_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Lista movimientos con filtros opcionales. Rango de fechas inclusivo en ambos extremos.
CREATE OR ALTER PROCEDURE dbo.usp_Movimiento_Listar
    @producto_id INT = NULL,
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL,
    @tipo VARCHAR(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT m.id, m.producto_id, p.codigo AS producto_codigo, p.nombre AS producto_nombre,
           m.tipo, m.cantidad, m.fecha, m.motivo, m.stock_anterior, m.stock_posterior,
           u.username AS usuario_username, m.fecha_registro
    FROM dbo.Movimiento m
    JOIN dbo.Producto p ON p.id = m.producto_id
    LEFT JOIN dbo.Usuario u ON u.id = m.usuario_id
    WHERE (@producto_id IS NULL OR m.producto_id = @producto_id)
      AND (@tipo IS NULL OR m.tipo = @tipo)
      AND (@fecha_desde IS NULL OR m.fecha >= @fecha_desde)
      AND (@fecha_hasta IS NULL OR m.fecha < DATEADD(DAY, 1, @fecha_hasta))
    ORDER BY m.fecha DESC, m.id DESC;
END
GO
