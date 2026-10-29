-- 04_sp_producto.sql: procedimientos de Producto (crear, actualizar, activar/desactivar, obtener, listar, stock bajo).

-- Crea un producto con stock inicial 0. Valida categoria, precios, codigo/nombre y duplicado de codigo.
CREATE OR ALTER PROCEDURE dbo.usp_Producto_Crear
    @codigo NVARCHAR(30),
    @nombre NVARCHAR(150),
    @descripcion NVARCHAR(500),
    @categoria_id INT,
    @precio_compra DECIMAL(12,2),
    @precio_venta DECIMAL(12,2),
    @stock_minimo INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @codigo IS NULL OR LTRIM(RTRIM(@codigo)) = N''
       OR @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = N''
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|Datos invalidos.', 1;
    END

    IF @precio_compra IS NULL OR @precio_compra <= 0
       OR @precio_venta IS NULL OR @precio_venta <= 0
       OR @stock_minimo IS NULL OR @stock_minimo < 0
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|Datos invalidos.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE id = @categoria_id)
    BEGIN
        THROW 50021, N'CATEGORIA_NO_ENCONTRADA|Categoria no encontrada.', 1;
    END

    IF EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = @codigo)
    BEGIN
        THROW 50030, N'PRODUCTO_CODIGO_DUPLICADO|El codigo de producto ya existe.', 1;
    END

    DECLARE @id INT;
    INSERT INTO dbo.Producto (codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, stock_minimo)
    VALUES (@codigo, @nombre, @descripcion, @categoria_id, @precio_compra, @precio_venta, @stock_minimo);
    SET @id = SCOPE_IDENTITY();

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE p.id = @id;
END
GO

-- Actualiza datos de un producto. No modifica stock_actual.
CREATE OR ALTER PROCEDURE dbo.usp_Producto_Actualizar
    @id INT,
    @codigo NVARCHAR(30),
    @nombre NVARCHAR(150),
    @descripcion NVARCHAR(500),
    @categoria_id INT,
    @precio_compra DECIMAL(12,2),
    @precio_venta DECIMAL(12,2),
    @stock_minimo INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE id = @id)
    BEGIN
        THROW 50031, N'PRODUCTO_NO_ENCONTRADO|Producto no encontrado.', 1;
    END

    IF @codigo IS NULL OR LTRIM(RTRIM(@codigo)) = N''
       OR @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = N''
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|Datos invalidos.', 1;
    END

    IF @precio_compra IS NULL OR @precio_compra <= 0
       OR @precio_venta IS NULL OR @precio_venta <= 0
       OR @stock_minimo IS NULL OR @stock_minimo < 0
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|Datos invalidos.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE id = @categoria_id)
    BEGIN
        THROW 50021, N'CATEGORIA_NO_ENCONTRADA|Categoria no encontrada.', 1;
    END

    IF EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = @codigo AND id <> @id)
    BEGIN
        THROW 50030, N'PRODUCTO_CODIGO_DUPLICADO|El codigo de producto ya existe.', 1;
    END

    UPDATE dbo.Producto
    SET codigo = @codigo,
        nombre = @nombre,
        descripcion = @descripcion,
        categoria_id = @categoria_id,
        precio_compra = @precio_compra,
        precio_venta = @precio_venta,
        stock_minimo = @stock_minimo,
        fecha_actualizacion = SYSUTCDATETIME()
    WHERE id = @id;

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE p.id = @id;
END
GO

-- Desactiva un producto (soft delete).
CREATE OR ALTER PROCEDURE dbo.usp_Producto_Desactivar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE id = @id)
    BEGIN
        THROW 50031, N'PRODUCTO_NO_ENCONTRADO|Producto no encontrado.', 1;
    END

    UPDATE dbo.Producto
    SET activo = 0,
        fecha_actualizacion = SYSUTCDATETIME()
    WHERE id = @id;

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE p.id = @id;
END
GO

-- Reactiva un producto.
CREATE OR ALTER PROCEDURE dbo.usp_Producto_Activar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE id = @id)
    BEGIN
        THROW 50031, N'PRODUCTO_NO_ENCONTRADO|Producto no encontrado.', 1;
    END

    UPDATE dbo.Producto
    SET activo = 1,
        fecha_actualizacion = SYSUTCDATETIME()
    WHERE id = @id;

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE p.id = @id;
END
GO

-- Obtiene un producto por id (0 o 1 fila).
CREATE OR ALTER PROCEDURE dbo.usp_Producto_ObtenerPorId
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE p.id = @id;
END
GO

-- Lista productos con filtros opcionales (busqueda por codigo o nombre, categoria, activos por defecto).
CREATE OR ALTER PROCEDURE dbo.usp_Producto_Listar
    @busqueda NVARCHAR(100) = NULL,
    @categoria_id INT = NULL,
    @incluir_inactivos BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE (@busqueda IS NULL OR p.codigo LIKE N'%' + @busqueda + N'%' OR p.nombre LIKE N'%' + @busqueda + N'%')
      AND (@categoria_id IS NULL OR p.categoria_id = @categoria_id)
      AND (@incluir_inactivos = 1 OR p.activo = 1)
    ORDER BY p.nombre;
END
GO

-- Lista productos activos con stock_actual <= stock_minimo.
CREATE OR ALTER PROCEDURE dbo.usp_Producto_StockBajo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, c.nombre AS categoria_nombre,
           p.precio_compra, p.precio_venta, p.stock_actual, p.stock_minimo, p.activo,
           CASE WHEN p.stock_actual <= p.stock_minimo THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS stock_bajo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON c.id = p.categoria_id
    WHERE p.activo = 1 AND p.stock_actual <= p.stock_minimo
    ORDER BY p.nombre;
END
GO
