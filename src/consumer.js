const { PrismaClient } = require("@prisma/client");
const { PubSub } = require("@google-cloud/pubsub");

const prisma = new PrismaClient();
const myId = require("../serjava-demo-df0baaecf12a.json");

// Carregar as credenciais do Google Cloud
const credentials = myId;
const subscriptionName = "projects/serjava-demo/subscriptions/duda-sub";

// Criar cliente do Pub/Sub
const pubSubClient = new PubSub({
  projectId: credentials.project_id,
  credentials: credentials,
});

async function consumeMessages() {
  try {
    // Obter a subscription
    const subscription = pubSubClient.subscription(subscriptionName);

    console.log(`Aguardando mensagens na subscription ${subscriptionName}`);

    // Criar um handler para processar as mensagens
    const messageHandler = async (message) => {
      try {
        console.log(`Recebida mensagem ${message.id}:`);
        const messageData = message.data.toString();
        console.log(`\tData: ${messageData}`);

        // Verificar se a mensagem é um JSON válido antes de tentar processá-la
        let reservaData;
        try {
          reservaData = JSON.parse(messageData);
        } catch (jsonError) {
          console.warn(`Mensagem não é um JSON válido: ${messageData}`);
          // Confirmar a mensagem mesmo não sendo um JSON válido para evitar reprocessamento
          message.ack();
          console.log(
            `Mensagem ${message.id} confirmada (não é um JSON válido)`
          );
          return;
        }

        // Verificar se o JSON tem a estrutura esperada
        if (!reservaData.uuid || !reservaData.customer || !reservaData.rooms) {
          console.warn(
            "Mensagem não contém a estrutura esperada de uma reserva"
          );
          message.ack();
          console.log(`Mensagem ${message.id} confirmada (formato inválido)`);
          return;
        }

        // Processar e salvar os dados no banco
        await processarReserva(reservaData);

        // Confirmar processamento da mensagem
        // message.ack(); // Confirmar para evitar reprocessamento
        console.log(`Mensagem ${message.id} processada com sucesso`);
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
        // Não confirmar a mensagem para que ela seja reentregue após o tempo de retry
        // Ou confirmar para evitar loops infinitos, dependendo da estratégia desejada
        message.ack(); // Confirmar para evitar loops infinitos de reprocessamento
        console.log(
          `Mensagem ${message.id} confirmada mesmo com erro para evitar loops`
        );
      }
    };

    // Registrar o handler de mensagens
    subscription.on("message", messageHandler);

    // Tratamento de erros na subscription
    subscription.on("error", (error) => {
      console.error("Erro na subscription:", error);
    });

    // Manter o processo rodando indefinidamente
    console.log(
      "Consumidor de mensagens iniciado. Pressione Ctrl+C para encerrar."
    );

    // Tratamento de interrupção do processo
    process.on("SIGINT", async () => {
      console.log("Encerrando consumidor de mensagens...");
      subscription.removeListener("message", messageHandler);
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("Erro ao iniciar consumidor de mensagens:", error);
    await prisma.$disconnect();
    // Tentar reconectar após um tempo
    setTimeout(consumeMessages, 5000);
  }
}

async function processarReserva(dados) {
  // Usar transação para garantir consistência
  return prisma.$transaction(async (tx) => {
    // Verificar se o cliente existe, caso contrário, criar
    let cliente = await tx.cliente.findUnique({
      where: { id: dados.customer.id },
    });

    if (!cliente) {
      cliente = await tx.cliente.create({
        data: {
          id: dados.customer.id,
          nome: dados.customer.name,
        },
      });
    }

    // Criar a reserva
    const reserva = await tx.reserva.create({
      data: {
        uuid: dados.uuid,
        createdAt: new Date(dados.created_at || new Date()),
        indexadoEm: new Date(),
        tipo: dados.type || "DEFAULT",
        clienteId: dados.customer.id,
      },
    });

    // Processar cada quarto da reserva
    for (const room of dados.rooms) {
      // Verificar se categoria e subcategoria existem, caso contrário, criar
      let categoria = await tx.categoria.findUnique({
        where: { id: room.category?.id || "DEFAULT" },
      });

      if (!categoria) {
        categoria = await tx.categoria.create({
          data: { id: room.category?.id || "DEFAULT" },
        });
      }

      let subCategoria = await tx.subCategoria.findUnique({
        where: { id: room.category?.sub_category?.id || "DEFAULT" },
      });

      if (!subCategoria) {
        subCategoria = await tx.subCategoria.create({
          data: {
            id: room.category?.sub_category?.id || "DEFAULT",
            categoriaId: room.category?.id || "DEFAULT",
          },
        });
      }

      // Verificar se o quarto existe, caso contrário, criar
      let quarto = await tx.quarto.findUnique({
        where: { id: room.id },
      });

      if (!quarto) {
        quarto = await tx.quarto.create({
          data: {
            id: room.id,
            categoriaId: room.category?.id || "DEFAULT",
            subCategoriaId: room.category?.sub_category?.id || "DEFAULT",
          },
        });
      }

      // Registrar o quarto reservado
      await tx.quartoReservado.create({
        data: {
          reservaId: reserva.id,
          quartoId: room.id,
          diaria: room.daily_rate || 0,
          numeroDias: room.number_of_days || 1,
          dataReserva: new Date(room.reservation_date || new Date()),
        },
      });
    }

    console.log(`Reserva ${dados.uuid} processada com sucesso`);
  });
}

// Iniciar o consumidor
consumeMessages().catch(console.error);
