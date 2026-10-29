-- 02_sp_usuario.sql: procedimientos de Usuario (crear y obtener por username).

-- Crea un usuario nuevo. Valida datos y unicidad de username.
CREATE OR ALTER PROCEDURE dbo.usp_Usuario_Crear
    @username NVARCHAR(50),
    @password_hash NVARCHAR(255),
    @nombre_completo NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF @username IS NULL OR LTRIM(RTRIM(@username)) = N''
       OR @nombre_completo IS NULL OR LTRIM(RTRIM(@nombre_completo)) = N''
       OR @password_hash IS NULL OR LTRIM(RTRIM(@password_hash)) = N''
    BEGIN
        THROW 50050, N'DATOS_INVALIDOS|Datos invalidos.', 1;
    END

    IF EXISTS (SELECT 1 FROM dbo.Usuario WHERE username = @username)
    BEGIN
        THROW 50010, N'USUARIO_DUPLICADO|El username ya existe.', 1;
    END

    DECLARE @id INT;
    INSERT INTO dbo.Usuario (username, password_hash, nombre_completo)
    VALUES (@username, @password_hash, @nombre_completo);
    SET @id = SCOPE_IDENTITY();

    SELECT id, username, nombre_completo, activo
    FROM dbo.Usuario
    WHERE id = @id;
END
GO

-- Obtiene un usuario por username (0 o 1 fila), incluye password_hash para login.
CREATE OR ALTER PROCEDURE dbo.usp_Usuario_ObtenerPorUsername
    @username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, username, password_hash, nombre_completo, activo
    FROM dbo.Usuario
    WHERE username = @username;
END
GO
