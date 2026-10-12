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
