# FSW Barber

Aplicação full stack para agendamento de serviços em barbearias, desenvolvida com Next.js, Prisma, PostgreSQL e autenticação via NextAuth.

## Visão geral

O projeto simula uma experiência real de agendamento de barbearia, com busca por serviços, listagem de estabelecimentos, reserva de horários, autenticação do usuário e avaliação de atendimento após o serviço.

## Funcionalidades

- Busca e listagem de barbearias
- Filtros por categoria/serviço
- Visualização de detalhes da barbearia
- Agendamento de horários
- Autenticação com Google
- Gestão de agendamentos confirmados e concluídos
- Cancelamento de reservas
- Avaliação de atendimento com nota de 1 a 5
- Feedback visual com mensagens de sucesso e erro

## Stack utilizada

- Next.js 14
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth
- Tailwind CSS
- shadcn/ui
- date-fns
- Sonner

## Estrutura do projeto

```bash
app/
  _actions/
  _components/
  _data/
  _lib/
  barbershops/
  bookings/
prisma/
public/
```

## Como executar localmente

```bash
# instalar dependências
pnpm install

# gerar cliente Prisma
npx prisma generate

# iniciar o banco e aplicar migrations
npx prisma migrate dev

# rodar a aplicação
pnpm dev
```

Acesse: http://localhost:3000

## Pagamentos com Mercado Pago

O agendamento gera uma cobrança Pix pela API de pagamentos do Mercado Pago. O
servidor usa o preço salvo no banco e retorna o QR Code e o código Pix copia e
cola para o cliente; a cobrança vence em uma hora. Um webhook verifica a
assinatura da notificação e consulta o pagamento diretamente no Mercado Pago.
O agendamento permanece pendente até que o pagamento seja aprovado e um
administrador confirme a reserva.

Configure estas variáveis no ambiente do servidor (por exemplo, no arquivo
`.env` local):

```env
MERCADO_PAGO_ACCESS_TOKEN="seu_access_token_de_teste_ou_producao"
MERCADO_PAGO_TEST_PAYER_EMAIL="email-da-conta-compradora-de-teste"
MERCADO_PAGO_WEBHOOK_SECRET="segredo_de_assinatura_do_webhook"
APP_URL="https://seu-dominio-publico"
```

Use o **Access Token de teste do vendedor** em `MERCADO_PAGO_ACCESS_TOKEN`. O
`client_token`, a `Public Key` e o `application_id` não são usados nesta
integração Pix server-side. `MERCADO_PAGO_WEBHOOK_SECRET` é o segredo de
assinatura configurado para as notificações, não o Access Token.

Para testes, crie também uma conta compradora de teste no painel de
desenvolvedores e coloque o e-mail dessa conta em
`MERCADO_PAGO_TEST_PAYER_EMAIL`. Esse valor é usado somente fora de produção;
em produção, o pagador é o e-mail da sessão autenticada.

No painel do Mercado Pago, configure a URL de notificações como
`{APP_URL}/api/mercadopago/webhook` e use o segredo correspondente em
`MERCADO_PAGO_WEBHOOK_SECRET`. Para testar localmente, exponha a aplicação por
um túnel HTTPS e use essa URL pública como `APP_URL`; `localhost` não pode
receber notificações externas. Nunca exponha o Access Token no navegador,
adicione-o ao repositório ou o envie por chat. As reservas sem pagamento
aprovado expiram e liberam o horário após uma hora. O cancelamento de uma
reserva paga solicita um reembolso ao Mercado Pago; se uma reserva cancelada
receber uma aprovação tardia, o webhook também tenta reembolsá-la.

Depois de configurar o banco e o `.env`, aplique a migration e inicie a
aplicação:

```bash
pnpm exec prisma migrate dev
pnpm dev
```

## Desafios implementados

- Integração de autenticação com sessão do usuário
- Persistência de dados com Prisma e PostgreSQL
- Fluxo de agendamento e revisão de reservas
- Lógica de apresentação condicional por status da reserva
- Feedback de UI para ações de confirmação, cancelamento e avaliação

## Objetivo do projeto

Este projeto foi construído para praticar e consolidar conceitos de desenvolvimento full stack, arquitetura de aplicações web modernas e experiência de usuário em um fluxo realista de agendamento.

## Status

Em desenvolvimento e em constante evolução, focado em boas práticas, organização de código e entrega de uma aplicação funcional e agradável.

## Autor

Desenvolvido como parte do desafio Full Stack Week e como exercício de crescimento em desenvolvimento web e aplicações com Next.js.

## Curso

FullStack club - Felipe Rocha
