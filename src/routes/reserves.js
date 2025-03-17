const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Rota para consultar reservas
router.get("/", async (req, res) => {
  try {
    const { uuid, clientId, quartoId } = req.query;

    // Construir filtro baseado nos parâmetros de consulta
    const where = {};

    if (uuid) {
      where.uuid = uuid;
    }

    if (clientId) {
      where.clienteId = parseInt(clientId);
    }

    if (quartoId) {
      where.quartosReservados = {
        some: {
          quartoId: parseInt(quartoId),
        },
      };
    }

    // Consultar reservas com os filtros aplicados
    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        cliente: true,
        quartosReservados: {
          include: {
            quarto: {
              include: {
                categoria: true,
                subCategoria: true,
              },
            },
          },
        },
      },
    });

    // Se não encontrou reservas, retornar array vazio
    if (reservas.length === 0) {
      return res.json([]);
    }

    // Formatar dados para o contrato de resposta
    const formattedReservas = reservas.map(formatReserva);

    res.json(
      formattedReservas.length === 1 ? formattedReservas[0] : formattedReservas
    );
  } catch (error) {
    console.error("Erro ao consultar reservas:", error);
    res
      .status(500)
      .json({ error: "Erro ao consultar reservas", message: error.message });
  }
});

// Rota específica para consultar reserva por UUID
router.get("/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const { clientId, quartoId } = req.query;

    // Construir filtro baseado nos parâmetros de consulta
    const where = { uuid };

    if (clientId) {
      where.clienteId = parseInt(clientId);
    }

    if (quartoId) {
      where.quartosReservados = {
        some: {
          quartoId: parseInt(quartoId),
        },
      };
    }

    const reserva = await prisma.reserva.findUnique({
      where,
      include: {
        cliente: true,
        quartosReservados: {
          include: {
            quarto: {
              include: {
                categoria: true,
                subCategoria: true,
              },
            },
          },
        },
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    // Formatar dados para o contrato de resposta
    const formattedReserva = formatReserva(reserva);

    return res.json(formattedReserva);
  } catch (error) {
    console.error("Erro ao consultar reserva por UUID:", error);
    res
      .status(500)
      .json({ error: "Erro ao consultar reserva", message: error.message });
  }
});

// Função para formatar os dados da reserva conforme contrato
function formatReserva(reserva) {
  // Calcular valor total da reserva
  let valorTotal = 0;

  const rooms = reserva.quartosReservados.map((qr) => {
    const roomValue = qr.diaria * qr.numeroDias;
    valorTotal += roomValue;

    return {
      id: qr.quartoId,
      daily_rate: qr.diaria,
      number_of_days: qr.numeroDias,
      reservation_date: qr.dataReserva.toISOString().split("T")[0],
      total_value: roomValue,
      category: {
        id: qr.quarto.categoria.id,
        sub_category: {
          id: qr.quarto.subCategoria.id,
        },
      },
    };
  });

  return {
    uuid: reserva.uuid,
    created_at: reserva.createdAt
      .toISOString()
      .replace("T", " ")
      .substring(0, 19),
    indexed_at: reserva.indexadoEm
      .toISOString()
      .replace("T", " ")
      .substring(0, 19),
    type: reserva.tipo,
    total_value: valorTotal,
    customer: {
      id: reserva.cliente.id,
      name: reserva.cliente.nome,
    },
    rooms: rooms,
  };
}

module.exports = router;
