-- verificacion.sql: pruebas manuales (no se ejecuta automaticamente). Ejecutar con sqlcmd.
-- Limpia y recrea datos de prueba; termina eliminando lo creado.

SET NOCOUNT ON;
PRINT '=== Verificacion TecnoStock ===';

-- Limpieza previa
DELETE FROM dbo.Movimiento WHERE producto_id IN (SELECT id FROM dbo.Producto WHERE codigo = N'TEST-VERIF');
DELETE FROM dbo.Producto WHERE codigo = N'TEST-VERIF';

DECLARE @cat INT = (SELECT TOP 1 id FROM dbo.Categoria ORDER BY id);

-- Crear producto de prueba via procedimiento
IF OBJECT_ID('tempdb..#prod') IS NOT NULL DROP TABLE #prod;
CREATE TABLE #prod (
    id INT, codigo NVARCHAR(30), nombre NVARCHAR(150), descripcion NVARCHAR(500),
    categoria_id INT, categoria_nombre NVARCHAR(100), precio_compra DECIMAL(12,2),
    precio_venta DECIMAL(12,2), stock_actual INT, stock_minimo INT, activo BIT,
    stock_bajo BIT, fecha_creacion DATETIME2(0), fecha_actualizacion DATETIME2(0)
);
INSERT INTO #prod EXEC dbo.usp_Producto_Crear
    @codigo=N'TEST-VERIF', @nombre=N'Producto Test', @descripcion=N'Test',
    @categoria_id=@cat, @precio_compra=10.00, @precio_venta=15.00, @stock_minimo=0;

DECLARE @pid INT = (SELECT id FROM #prod);
PRINT 'Producto de prueba id=' + CAST(@pid AS NVARCHAR(20));

IF OBJECT_ID('tempdb..#mov') IS NOT NULL DROP TABLE #mov;
CREATE TABLE #mov (
    id BIGINT, producto_id INT, producto_codigo NVARCHAR(30), producto_nombre NVARCHAR(150),
    tipo VARCHAR(7), cantidad INT, fecha DATETIME2(0), motivo NVARCHAR(255),
    stock_anterior INT, stock_posterior INT, usuario_username NVARCHAR(50), fecha_registro DATETIME2(0)
);

-- Test 1: entrada valida
PRINT 'Test 1: entrada valida';
DECLARE @fecha DATETIME2(0) = SYSUTCDATETIME();
DELETE FROM #mov;
INSERT INTO #mov EXEC dbo.usp_Movimiento_RegistrarEntrada
    @producto_id=@pid, @cantidad=5, @fecha=@fecha, @motivo=N'Test entrada', @usuario_id=NULL;
DECLARE @stock1 INT = (SELECT stock_actual FROM dbo.Producto WHERE id=@pid);
DECLARE @sa1 INT = (SELECT stock_anterior FROM #mov);
DECLARE @sp1 INT = (SELECT stock_posterior FROM #mov);
IF @stock1 = 5 AND @sa1 = 0 AND @sp1 = 5
    PRINT '  OK';
ELSE
    PRINT '  FAIL stock=' + CAST(@stock1 AS NVARCHAR(20)) + ' sa=' + CAST(@sa1 AS NVARCHAR(20)) + ' sp=' + CAST(@sp1 AS NVARCHAR(20));

-- Test 2: salida valida
PRINT 'Test 2: salida valida';
DELETE FROM #mov;
INSERT INTO #mov EXEC dbo.usp_Movimiento_RegistrarSalida
    @producto_id=@pid, @cantidad=2, @fecha=@fecha, @motivo=N'Test salida', @usuario_id=NULL;
DECLARE @stock2 INT = (SELECT stock_actual FROM dbo.Producto WHERE id=@pid);
DECLARE @sa2 INT = (SELECT stock_anterior FROM #mov);
DECLARE @sp2 INT = (SELECT stock_posterior FROM #mov);
IF @stock2 = 3 AND @sa2 = 5 AND @sp2 = 3
    PRINT '  OK';
ELSE
    PRINT '  FAIL stock=' + CAST(@stock2 AS NVARCHAR(20)) + ' sa=' + CAST(@sa2 AS NVARCHAR(20)) + ' sp=' + CAST(@sp2 AS NVARCHAR(20));

-- Test 3: salida mayor al stock
PRINT 'Test 3: salida mayor al stock';
DECLARE @stockAntes3 INT = (SELECT stock_actual FROM dbo.Producto WHERE id=@pid);
DECLARE @movCount3 INT = (SELECT COUNT(*) FROM dbo.Movimiento WHERE producto_id=@pid);
BEGIN TRY
    EXEC dbo.usp_Movimiento_RegistrarSalida @producto_id=@pid, @cantidad=100, @fecha=@fecha, @motivo=N'Test insuf', @usuario_id=NULL;
    PRINT '  FAIL: no lanzo error';
END TRY
BEGIN CATCH
    DECLARE @msg3 NVARCHAR(4000) = ERROR_MESSAGE();
    IF CHARINDEX(N'STOCK_INSUFICIENTE', @msg3) > 0
        PRINT '  OK: ' + @msg3;
    ELSE
        PRINT '  FAIL: error inesperado: ' + @msg3;
END CATCH
DECLARE @stockDespues3 INT = (SELECT stock_actual FROM dbo.Producto WHERE id=@pid);
DECLARE @movCount3b INT = (SELECT COUNT(*) FROM dbo.Movimiento WHERE producto_id=@pid);
IF @stockDespues3 = @stockAntes3 AND @movCount3b = @movCount3
    PRINT '  OK: stock e historial sin cambios';
ELSE
    PRINT '  FAIL: stock/movimientos cambiaron';

-- Test 4: cantidad 0 o negativa
PRINT 'Test 4: cantidad invalida';
BEGIN TRY
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@pid, @cantidad=0, @fecha=@fecha, @motivo=N'Test', @usuario_id=NULL;
    PRINT '  FAIL: cantidad 0 no lanzo error';
END TRY
BEGIN CATCH
    IF CHARINDEX(N'CANTIDAD_INVALIDA', ERROR_MESSAGE()) > 0
        PRINT '  OK: cantidad 0 -> CANTIDAD_INVALIDA';
    ELSE
        PRINT '  FAIL: ' + ERROR_MESSAGE();
END CATCH
BEGIN TRY
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@pid, @cantidad=-1, @fecha=@fecha, @motivo=N'Test', @usuario_id=NULL;
    PRINT '  FAIL: cantidad -1 no lanzo error';
END TRY
BEGIN CATCH
    IF CHARINDEX(N'CANTIDAD_INVALIDA', ERROR_MESSAGE()) > 0
        PRINT '  OK: cantidad -1 -> CANTIDAD_INVALIDA';
    ELSE
        PRINT '  FAIL: ' + ERROR_MESSAGE();
END CATCH

-- Test 5: codigo duplicado
PRINT 'Test 5: codigo duplicado';
BEGIN TRY
    INSERT INTO #prod EXEC dbo.usp_Producto_Crear
        @codigo=N'TEST-VERIF', @nombre=N'Dup', @descripcion=N'Dup',
        @categoria_id=@cat, @precio_compra=10.00, @precio_venta=15.00, @stock_minimo=0;
    PRINT '  FAIL: duplicado no lanzo error';
END TRY
BEGIN CATCH
    IF CHARINDEX(N'PRODUCTO_CODIGO_DUPLICADO', ERROR_MESSAGE()) > 0
        PRINT '  OK: PRODUCTO_CODIGO_DUPLICADO';
    ELSE
        PRINT '  FAIL: ' + ERROR_MESSAGE();
END CATCH

-- Test 6: movimiento sobre producto desactivado
PRINT 'Test 6: producto inactivo';
EXEC dbo.usp_Producto_Desactivar @id=@pid;
BEGIN TRY
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@pid, @cantidad=1, @fecha=@fecha, @motivo=N'Test', @usuario_id=NULL;
    PRINT '  FAIL: no lanzo error';
END TRY
BEGIN CATCH
    IF CHARINDEX(N'PRODUCTO_INACTIVO', ERROR_MESSAGE()) > 0
        PRINT '  OK: PRODUCTO_INACTIVO';
    ELSE
        PRINT '  FAIL: ' + ERROR_MESSAGE();
END CATCH
EXEC dbo.usp_Producto_Activar @id=@pid;

-- Test 7: DELETE fisico con movimientos
PRINT 'Test 7: DELETE fisico con movimientos';
BEGIN TRY
    DELETE FROM dbo.Producto WHERE id = @pid;
    PRINT '  FAIL: DELETE no fallo';
END TRY
BEGIN CATCH
    PRINT '  OK: fallo por FK (esperado): ' + ERROR_MESSAGE();
END CATCH

-- Test 8: filtro listar por producto y rango de fechas inclusivo
PRINT 'Test 8: filtro Movimiento_Listar';
DECLARE @cntProd INT;
EXEC dbo.usp_Movimiento_Listar @producto_id=@pid;
-- contar via temp table
IF OBJECT_ID('tempdb..#lst') IS NOT NULL DROP TABLE #lst;
CREATE TABLE #lst (
    id BIGINT, producto_id INT, producto_codigo NVARCHAR(30), producto_nombre NVARCHAR(150),
    tipo VARCHAR(7), cantidad INT, fecha DATETIME2(0), motivo NVARCHAR(255),
    stock_anterior INT, stock_posterior INT, usuario_username NVARCHAR(50), fecha_registro DATETIME2(0)
);
DELETE FROM #lst;
INSERT INTO #lst EXEC dbo.usp_Movimiento_Listar @producto_id=@pid;
DECLARE @c1 INT = (SELECT COUNT(*) FROM #lst);
PRINT '  Por producto: ' + CAST(@c1 AS NVARCHAR(20)) + ' fila(s)';
-- rango inclusivo con fecha del dia del movimiento
DECLARE @d1 DATE = CAST(@fecha AS DATE);
DELETE FROM #lst;
INSERT INTO #lst EXEC dbo.usp_Movimiento_Listar @fecha_desde=@d1, @fecha_hasta=@d1;
DECLARE @c2 INT = (SELECT COUNT(*) FROM #lst);
PRINT '  Por rango inclusivo (mismo dia): ' + CAST(@c2 AS NVARCHAR(20)) + ' fila(s)';

-- Limpieza final
DELETE FROM dbo.Movimiento WHERE producto_id = @pid;
DELETE FROM dbo.Producto WHERE id = @pid;
PRINT '=== Limpieza completada ===';
GO
