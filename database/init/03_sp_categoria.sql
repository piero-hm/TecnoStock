-- 03_sp_categoria.sql: procedimientos de Categoria (crear y listar).

-- Crea una categoria nueva validando nombre no vacio y unicidad.
CREATE OR ALTER PROCEDURE dbo.usp_Categoria_Crear
    @nombre NVARCHAR(100),
    @descripcion NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = N''
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|Datos invalidos.', 1;
    END

    IF EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = @nombre)
    BEGIN
        THROW 50020, N'CATEGORIA_DUPLICADA|La categoria ya existe.', 1;
    END

    DECLARE @id INT;
    INSERT INTO dbo.Categoria (nombre, descripcion)
    VALUES (@nombre, @descripcion);
    SET @id = SCOPE_IDENTITY();

    SELECT id, nombre, descripcion, fecha_creacion
    FROM dbo.Categoria
    WHERE id = @id;
END
GO

-- Lista todas las categorias ordenadas por nombre.
CREATE OR ALTER PROCEDURE dbo.usp_Categoria_Listar
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, nombre, descripcion, fecha_creacion
    FROM dbo.Categoria
    ORDER BY nombre;
END
GO
