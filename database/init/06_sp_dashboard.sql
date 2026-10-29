-- 06_sp_dashboard.sql: indicadores del dashboard de inventario.

-- Devuelve conteos y valor del inventario considerando solo productos activos.
CREATE OR ALTER PROCEDURE dbo.usp_Dashboard_Indicadores
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM dbo.Producto WHERE activo = 1) AS productos_activos,
        (SELECT COUNT(*) FROM dbo.Producto WHERE activo = 1 AND stock_actual <= stock_minimo) AS productos_stock_bajo,
        ISNULL((SELECT SUM(stock_actual * precio_compra) FROM dbo.Producto WHERE activo = 1), CAST(0 AS DECIMAL(18,2))) AS valor_inventario_compra,
        ISNULL((SELECT SUM(stock_actual * precio_venta) FROM dbo.Producto WHERE activo = 1), CAST(0 AS DECIMAL(18,2))) AS valor_inventario_venta;
END
GO
