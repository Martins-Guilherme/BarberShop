# FSW Barber

Aplicação full stack para busca de barbearias e agendamento de serviços, com autenticação Google, pagamento Pix pelo Mercado Pago e painel administrativo.

Projeto desenvolvido a partir da Full Stack Week, com evoluções próprias nos fluxos de reservas, avaliações, disponibilidade semanal e pagamentos.

## Índice

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Execução local](#execução-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Pagamentos Pix](#pagamentos-pix)
- [Painel administrativo](#painel-administrativo)
- [Scripts disponíveis](#scripts-disponíveis)
- [Validação local](#validação-local)
- [Publicação na Vercel](#publicação-na-vercel)
- [Solução de problemas](#solução-de-problemas)
- [Status e escopo](#status-e-escopo)
- [Autor e créditos](#autor-e-créditos)
- [Licença](#licença)

## Visão geral

O FSW Barber reúne a experiência do cliente e a administração dos agendamentos em uma aplicação Next.js com App Router. Os dados são persistidos em PostgreSQL por meio do Prisma, e as operações de reserva são executadas no servidor.

O pagamento aprovado não confirma automaticamente o atendimento: a reserva permanece pendente até a confirmação de um administrador.

## Funcionalidades

### Cliente

- Autenticação com Google.
- Busca e listagem de barbearias.
- Atalhos de busca por serviço.
- Visualização de serviços, preços e informações do estabelecimento.
- Seleção de horários conforme a disponibilidade semanal configurada.
- Geração de cobrança Pix com QR Code e código copia e cola.
- Consulta dos próprios agendamentos e seus estados.
- Cancelamento de reservas pendentes ou confirmadas.
- Solicitação de reembolso ao cancelar uma reserva com pagamento aprovado.
- Avaliação de 1 a 5 para atendimentos finalizados, limitada a uma avaliação por reserva.
- Feedback visual de sucesso e erro.

### Administração

- Acesso restrito a usuários.
- Dashboard com totais de agendamentos, estados e avaliação média.
- Tabela de agendamentos recentes.
- Consulta de reservas pendentes e confirmação de reservas pagas.
- Configuração dos dias de funcionamento e horários semanais.

### Pagamentos

- Integração server-side com a API de pagamentos do Mercado Pago.
- Valor da cobrança obtido do serviço salvo no banco.
- Prazo de pagamento de uma hora.
- Webhook com validação de assinatura e consulta do pagamento no Mercado Pago.
- Conferência da referência da reserva, valor e moeda antes da atualização.
- Tratamento de rejeições, reembolsos e aprovações tardias.

## Tecnologias

- **Next.js 14.2.5** e App Router.
- **React 18** e **TypeScript**.
- **Prisma ORM 7** com `@prisma/adapter-pg`.
- **PostgreSQL**.
- **NextAuth 4** com autenticação Google e Prisma Adapter.
- **Tailwind CSS 4**, **shadcn/ui**, **Base UI** e componentes Radix UI.
- **React Hook Form** e **Zod**.
- **TanStack Table**, **React DayPicker** e **date-fns**.
- **Sonner** e **Lucide React**.
- **pnpm**, **ESLint**, **Prettier**, **Husky** e **lint-staged**.

As versões exatas das dependências resolvidas estão registradas em `pnpm-lock.yaml`.

## Estrutura do projeto

```text
BarberShop/
├── app/
│   ├── _actions/             # Server Actions
│   ├── _components/          # Componentes da aplicação
│   │   └── ui/               # Componentes de interface reutilizáveis
│   ├── _constants/           # Constantes e opções de busca
│   ├── _data/                # Consultas e operações de dados
│   ├── _generated/prisma/    # Cliente e tipos gerados pelo Prisma
│   ├── _lib/                 # Autenticação, banco, pagamentos e utilitários
│   ├── _providers/           # Provedores de contexto
│   ├── _types/               # Tipos compartilhados
│   ├── types/                # Extensão de tipos do NextAuth
│   ├── about/                # Sobre o projeto
│   ├── admin/                # Dashboard administrativo
│   │   └── availability/     # Disponibilidade semanal
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Autenticação
│   │   └── mercadopago/
│   │       └── webhook/      # Notificações de pagamento
│   ├── barbershops/
│   │   ├── page.tsx          # Listagem e busca
│   │   └── [id]/             # Detalhes e reserva
│   ├── bookings/             # Agendamentos do usuário
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página inicial
├── prisma/
│   ├── migrations/           # Histórico do schema do banco
│   ├── schema.prisma         # Modelos de dados
│   └── seed.ts               # Dados fictícios de demonstração
├── public/                   # Imagens, ícones e arquivos estáticos
├── .env.example              # Referência de variáveis de ambiente
├── components.json           # Configuração do shadcn/ui
├── next.config.mjs           # Configuração do Next.js
├── package.json              # Dependências e scripts
├── pnpm-lock.yaml            # Dependências resolvidas
├── prisma.config.ts          # Configuração do Prisma CLI e seed
└── tsconfig.json             # Configuração do TypeScript
```

As pastas com prefixo `_` organizam código interno e não criam rotas no App Router. As páginas usam `page.tsx`; os endpoints usam `route.ts`.

Não edite manualmente o conteúdo de `app/_generated/prisma/`. Regenere-o com o Prisma CLI.

## Execução local

### Pré-requisitos

- Git.
- Node.js 22.x, a partir da versão 22.12.0.
- pnpm instalado.
- PostgreSQL 15 ou superior disponível.
- Credenciais OAuth do Google para testar autenticação.
- Credenciais do Mercado Pago para testar reservas com Pix.
- Docker e Docker Compose apenas se você optar por executar o banco em um contêiner.

### 1. Clonar e instalar

```bash
git clone https://github.com/Martins-Guilherme/BarberShop.git
cd BarberShop
pnpm install --frozen-lockfile
```

### 2. Configurar o ambiente

Crie um arquivo `.env` na raiz usando o exemplo da próxima seção. Substitua os valores fictícios pelas configurações locais.

O `.env.example` atual contém definições duplicadas e orientações sem comentário. Não o copie sem revisar: mantenha apenas uma definição de `DATABASE_URL` e use o nome `NEXT_AUTH_SECRET`, lido explicitamente pela aplicação.

No cliente OAuth do Google, configure:

- **Origem autorizada:** `http://localhost:3000`
- **URI de redirecionamento:** `http://localhost:3000/api/auth/callback/google`

### 3. Preparar o banco

Inicie seu serviço PostgreSQL e crie o banco indicado em `DATABASE_URL`, se necessário. Confira que a conexão aponta para um banco de desenvolvimento.

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

`migrate dev` aplica as migrations; ele não inicia o PostgreSQL. Não use esse comando apontando para produção. Se o Prisma solicitar um reset, confira a conexão e os dados antes de aceitar.

### 4. Popular dados de demonstração — opcional

Em um banco novo de desenvolvimento:

```bash
pnpm exec prisma db seed
```

O seed cria barbearias e serviços fictícios. Ele não é idempotente: rodá-lo novamente pode duplicar esses registros. Não cria um administrador.

A configuração de seed usada pelo Prisma CLI está em `prisma.config.ts`.

### 5. Iniciar a aplicação

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Para navegar pelas listagens, configure o banco e os dados. Para entrar, configure o Google OAuth. Para concluir o fluxo de reserva com Pix, configure também a integração de pagamentos.

## Variáveis de ambiente

Exemplo de `.env` local, somente com valores fictícios:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fsw_barber"

AUTH_GOOGLE_ID="seu_client_id"
AUTH_GOOGLE_SECRET="seu_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_AUTH_SECRET="substitua_por_um_segredo_aleatorio"

MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_TEST_PAYER_EMAIL=""
MERCADO_PAGO_WEBHOOK_SECRET=""
APP_URL="http://localhost:3000"
```

- `DATABASE_URL`: conexão PostgreSQL, usada pela aplicação e pelo Prisma CLI.
- `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`: credenciais do cliente OAuth Google.
- `NEXTAUTH_URL`: URL de acesso da aplicação para autenticação.
- `NEXT_AUTH_SECRET`: segredo da autenticação, conforme `app/_lib/auth.ts`. Não confundir com `NEXTAUTH_SECRET`.
- `MERCADO_PAGO_ACCESS_TOKEN`: token privado da conta vendedora.
- `MERCADO_PAGO_TEST_PAYER_EMAIL`: e-mail da conta compradora de teste usado quando o token começa com `TEST-`.
- `MERCADO_PAGO_WEBHOOK_SECRET`: segredo de assinatura das notificações. Não é o Access Token.
- `APP_URL`: origem da aplicação usada para compor a URL do webhook. Para receber notificações, precisa ser HTTPS e pública.

Para gerar um segredo aleatório para `NEXT_AUTH_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado para o `.env`. Não use o valor fictício do exemplo como segredo real.

Nunca versione o `.env`, exponha tokens no navegador ou adicione o prefixo `NEXT_PUBLIC_` a segredos. Reinicie a aplicação após alterar as variáveis locais.

## Pagamentos Pix

### Fluxo da reserva

1. O usuário autenticado escolhe um serviço e horário disponível.
2. O servidor valida a disponibilidade e busca o preço no banco.
3. A reserva é criada com agendamento e pagamento pendentes.
4. A API do Mercado Pago gera a cobrança Pix com validade de uma hora.
5. A interface apresenta QR Code e código copia e cola.
6. O webhook valida a assinatura, consulta o pagamento e confere seus dados.
7. Com o pagamento aprovado, um administrador pode confirmar o agendamento futuro.

A aprovação do pagamento e a confirmação do atendimento são estados distintos.

### Ambiente de teste

- Configure o Access Token de teste da conta vendedora em `MERCADO_PAGO_ACCESS_TOKEN`.
- Configure o e-mail da conta compradora de teste em `MERCADO_PAGO_TEST_PAYER_EMAIL`.
- Quando o token começa com `TEST-`, o código usa esse e-mail de teste, inclusive em um deployment de teste na Vercel.
- Com um token que não começa com `TEST-`, o código usa o e-mail da sessão autenticada.
- A integração Pix atual é server-side e não utiliza Public Key, `client_token` ou `application_id`.

A disponibilidade dos recursos de teste depende da conta e das regras do Mercado Pago. A presença da integração no código não substitui um teste ponta a ponta.

### Webhook local

O Mercado Pago não consegue enviar notificações diretamente para `localhost`. Para testar:

1. Exponha a aplicação local por um túnel HTTPS.
2. Defina `APP_URL` com a origem pública do túnel, sem caminho, aspas extras ou barra final.
3. Configure a URL de notificações como `{APP_URL}/api/mercadopago/webhook`.
4. Configure o segredo correspondente em `MERCADO_PAGO_WEBHOOK_SECRET`.
5. Reinicie a aplicação.

Se a URL do túnel mudar, atualize a configuração local e a configuração das notificações.

### Expiração e reembolso

- A cobrança tem prazo de uma hora.
- O código cancela reservas pendentes não pagas e marca o pagamento como expirado quando a rotina de expiração é executada pelos fluxos da aplicação. Não há garantia de atualização do banco exatamente no segundo do vencimento.
- O cancelamento de uma reserva com pagamento aprovado solicita um reembolso ao Mercado Pago.
- Aprovações tardias são verificadas pelo webhook. Conforme o prazo, a situação da reserva e os conflitos de horário, o código pode recuperar a reserva pendente ou solicitar reembolso.
- Falhas ou atrasos da API e das notificações devem ser investigados antes de considerar um pagamento ou reembolso concluído.

## Painel administrativo

- `/admin`: dashboard e acompanhamento dos agendamentos.
- `/admin/availability`: configuração semanal de funcionamento.

O acesso exige uma sessão com `role` igual a `ADMIN`. Novos usuários têm o papel `USER` por padrão.

Para testar localmente:

1. Entre com Google para criar seu usuário.
2. Confira que `DATABASE_URL` aponta para o banco local correto.
3. Abra `pnpm exec prisma studio`.
4. Localize apenas seu usuário na tabela `User` e altere `role` para `ADMIN`.
5. Saia e entre novamente na aplicação, se necessário.

Essa alteração concede privilégios administrativos. Não a faça indiscriminadamente em produção.

A disponibilidade semanal atual é compartilhada pela aplicação, sem configuração individual por barbearia. A validação de conflitos de reserva também considera o horário globalmente. Essas regras devem ser consideradas antes de adaptar o projeto para múltiplas agendas independentes.

## Scripts disponíveis

- `pnpm dev`: inicia o servidor de desenvolvimento.
- `pnpm local`: inicia o servidor de desenvolvimento escutando em `0.0.0.0`, permitindo acesso pela rede conforme firewall e configuração do dispositivo.
- `pnpm build`: gera o build de produção.
- `pnpm start`: serve o build de produção já gerado.
- `pnpm lint`: executa o lint do Next.js.
- `pnpm preview`: inicia o Docker Compose no caminho pessoal `$HOME/Docker/postgress-barbershop` e executa `prisma migrate dev`.

O script `preview` é específico do ambiente local do autor: não é uma prévia da interface, não inicia o Next.js e não é obrigatório para quem usa outra instalação PostgreSQL. Confira a conexão do banco antes de executá-lo.

O repositório não inclui esse ambiente Docker externo. Configure seu próprio PostgreSQL ou adapte o script ao seu ambiente.

## Validação local

Com as variáveis configuradas e o banco acessível:

```bash
pnpm lint
pnpm build
pnpm start
```

Encerre o servidor de desenvolvimento antes de iniciar o build na mesma porta. A geração do build pode consultar o banco; não valide usando uma conexão de produção por conveniência.

Sugestão de conferência manual:

- Abrir a página inicial e usar a busca por serviço.
- Clicar em **Reservar** e conferir a barbearia de destino.
- Entrar e sair com Google.
- Configurar a disponibilidade semanal com um usuário administrador.
- Criar uma reserva de teste e conferir o Pix.
- Validar a notificação de pagamento, a confirmação administrativa e os estados exibidos.
- Testar cancelamento, reembolso e avaliação conforme os pré-requisitos de cada fluxo.

Não há um script de testes automatizados em `package.json`. Build e lint não comprovam, sozinhos, o funcionamento completo da autenticação, dos pagamentos ou do deployment.

## Status e escopo

Projeto educacional em desenvolvimento, com foco em práticas de desenvolvimento full stack e experiência de agendamento.

O fluxo inclui autenticação, persistência, reservas, disponibilidade semanal, avaliações, painel administrativo e integração Pix. A operação real depende da configuração dos ambientes e da validação das integrações.

O projeto ainda não representa uma agenda independente por profissional ou por estabelecimento. Mudanças para uso real devem considerar concorrência nas reservas, permissões, observabilidade, proteção de dados e testes automatizados, além da revisão das regras de negócio.

## Autor e créditos

Desenvolvido por [Guilherme Martins](https://github.com/Martins-Guilherme).

Base de estudo: **Full Stack Week**, do **Full Stack Club**, com **Felipe Rocha**. Evoluções posteriores incluem os fluxos administrativos, disponibilidade semanal e pagamentos documentados neste repositório.

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE).
