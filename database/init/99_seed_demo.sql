-- 99_seed_demo.sql: datos de demostracion (idempotentes). Categorias, productos y movimientos de ejemplo.

-- Categorias
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = N'Laptops')
    EXEC dbo.usp_Categoria_Crear @nombre = N'Laptops', @descripcion = N'Computadoras portatiles';
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = N'Perifericos')
    EXEC dbo.usp_Categoria_Crear @nombre = N'Perifericos', @descripcion = N'Accesorios y perifericos';
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = N'Almacenamiento')
    EXEC dbo.usp_Categoria_Crear @nombre = N'Almacenamiento', @descripcion = N'Discos y memorias';
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = N'Redes')
    EXEC dbo.usp_Categoria_Crear @nombre = N'Redes', @descripcion = N'Equipos de red';
GO

DECLARE @cat_lap INT = (SELECT id FROM dbo.Categoria WHERE nombre = N'Laptops');
DECLARE @cat_per INT = (SELECT id FROM dbo.Categoria WHERE nombre = N'Perifericos');
DECLARE @cat_alm INT = (SELECT id FROM dbo.Categoria WHERE nombre = N'Almacenamiento');
DECLARE @cat_red INT = (SELECT id FROM dbo.Categoria WHERE nombre = N'Redes');

-- Productos
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'LAP-001')
    EXEC dbo.usp_Producto_Crear @codigo=N'LAP-001', @nombre=N'Laptop Pro 14', @descripcion=N'Laptop profesional 14 pulgadas', @categoria_id=@cat_lap, @precio_compra=2500.00, @precio_venta=3200.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'LAP-002')
    EXEC dbo.usp_Producto_Crear @codigo=N'LAP-002', @nombre=N'Laptop Office 15', @descripcion=N'Laptop oficina 15 pulgadas', @categoria_id=@cat_lap, @precio_compra=1800.00, @precio_venta=2300.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'PER-001')
    EXEC dbo.usp_Producto_Crear @codigo=N'PER-001', @nombre=N'Mouse Inalambrico', @descripcion=N'Mouse optico inalambrico', @categoria_id=@cat_per, @precio_compra=25.00, @precio_venta=45.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'PER-002')
    EXEC dbo.usp_Producto_Crear @codigo=N'PER-002', @nombre=N'Teclado Mecanico', @descripcion=N'Teclado mecanico retroiluminado', @categoria_id=@cat_per, @precio_compra=60.00, @precio_venta=95.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'PER-003')
    EXEC dbo.usp_Producto_Crear @codigo=N'PER-003', @nombre=N'Monitor 24', @descripcion=N'Monitor LED 24 pulgadas', @categoria_id=@cat_per, @precio_compra=400.00, @precio_venta=520.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'ALM-001')
    EXEC dbo.usp_Producto_Crear @codigo=N'ALM-001', @nombre=N'SSD 1TB', @descripcion=N'Disco solido 1TB', @categoria_id=@cat_alm, @precio_compra=80.00, @precio_venta=120.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'ALM-002')
    EXEC dbo.usp_Producto_Crear @codigo=N'ALM-002', @nombre=N'HDD 2TB', @descripcion=N'Disco duro 2TB', @categoria_id=@cat_alm, @precio_compra=55.00, @precio_venta=85.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'ALM-003')
    EXEC dbo.usp_Producto_Crear @codigo=N'ALM-003', @nombre=N'USB 64GB', @descripcion=N'Memoria USB 64GB', @categoria_id=@cat_alm, @precio_compra=12.00, @precio_venta=22.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'RED-001')
    EXEC dbo.usp_Producto_Crear @codigo=N'RED-001', @nombre=N'Router WiFi 6', @descripcion=N'Router inalambrico WiFi 6', @categoria_id=@cat_red, @precio_compra=150.00, @precio_venta=210.00, @stock_minimo=5;
IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = N'RED-002')
    EXEC dbo.usp_Producto_Crear @codigo=N'RED-002', @nombre=N'Switch 8 puertos', @descripcion=N'Switch Ethernet 8 puertos', @categoria_id=@cat_red, @precio_compra=70.00, @precio_venta=110.00, @stock_minimo=5;
GO

-- Movimientos de demostracion (solo si no hay movimientos previos)
IF NOT EXISTS (SELECT 1 FROM dbo.Movimiento)
BEGIN
    DECLARE @d DATETIME2(0) = SYSUTCDATETIME();
    DECLARE @p_lap1 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'LAP-001');
    DECLARE @p_lap2 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'LAP-002');
    DECLARE @p_per1 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'PER-001');
    DECLARE @p_per2 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'PER-002');
    DECLARE @p_per3 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'PER-003');
    DECLARE @p_alm1 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'ALM-001');
    DECLARE @p_alm2 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'ALM-002');
    DECLARE @p_alm3 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'ALM-003');
    DECLARE @p_red1 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'RED-001');
    DECLARE @p_red2 INT = (SELECT id FROM dbo.Producto WHERE codigo = N'RED-002');

    -- Entradas
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_lap1, @cantidad=10, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_lap2, @cantidad=8, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_per1, @cantidad=30, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_per2, @cantidad=20, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_per3, @cantidad=12, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_alm1, @cantidad=25, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_alm2, @cantidad=15, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarEntrada @producto_id=@p_alm3, @cantidad=50, @fecha=@d, @motivo=N'Compra inicial', @usuario_id=NULL;
    -- RED-001 y RED-002 quedan con stock 0 (stock bajo)

    -- Salidas
    EXEC dbo.usp_Movimiento_RegistrarSalida @producto_id=@p_per1, @cantidad=5, @fecha=@d, @motivo=N'Venta mostrador', @usuario_id=NULL;
    EXEC dbo.usp_Movimiento_RegistrarSalida @producto_id=@p_alm3, @cantidad=10, @fecha=@d, @motivo=N'Venta mostrador', @usuario_id=NULL;
END
GO
