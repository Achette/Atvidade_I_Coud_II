-- CreateTable
CREATE TABLE "clientes" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categorias" (
    "id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,

    CONSTRAINT "sub_categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quartos" (
    "id" SERIAL NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "sub_categoria_id" TEXT NOT NULL,

    CONSTRAINT "quartos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "cliente_id" INTEGER NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quartos_reservados" (
    "id" SERIAL NOT NULL,
    "reserva_id" INTEGER NOT NULL,
    "quarto_id" INTEGER NOT NULL,
    "diaria" DOUBLE PRECISION NOT NULL,
    "numero_dias" INTEGER NOT NULL,
    "data_reserva" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quartos_reservados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservas_uuid_key" ON "reservas"("uuid");

-- AddForeignKey
ALTER TABLE "sub_categorias" ADD CONSTRAINT "sub_categorias_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quartos" ADD CONSTRAINT "quartos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quartos" ADD CONSTRAINT "quartos_sub_categoria_id_fkey" FOREIGN KEY ("sub_categoria_id") REFERENCES "sub_categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quartos_reservados" ADD CONSTRAINT "quartos_reservados_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quartos_reservados" ADD CONSTRAINT "quartos_reservados_quarto_id_fkey" FOREIGN KEY ("quarto_id") REFERENCES "quartos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
