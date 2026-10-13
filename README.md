# LeadScore IA ⚡

Aplicação web para captação, classificação e priorização de leads comerciais de pequenas e médias empresas, integrando **Next.js (App Router)**, **Neon PostgreSQL**, **Drizzle ORM** e **Google Gemini API (gemini-3.8-flash)**.

- **🌐 Deploy Público na Vercel:** [https://leadscore-ia-eight.vercel.app](https://leadscore-ia-eight.vercel.app)
- **📦 Repositório GitHub:** [https://github.com/guinunesfcb/leadscore-ia](https://github.com/guinunesfcb/leadscore-ia)

Desenvolvido com o auxílio do agente inteligente **Google Antigravity** no Visual Studio Code.

---

## 🚀 Funcionalidades (Fase 1 - MVP)

1. **Formulário de Captação de Leads:**
   - Interface limpa e responsiva para cadastro de contatos comerciais (nome, e-mail, empresa, segmento e mensagem/dor do cliente).
2. **Análise de Potencial Comercial com Gemini AI:**
   - Avaliação com o modelo oficial `gemini-3.8-flash`.
   - Geração de **Score de 0 a 100** e classificação (**Quente**, **Morno**, **Frio**).
   - Justificativa comercial detalhada sobre a pontuação atribuída.
   - Sugestão personalizada de resposta para o vendedor abordar o lead imediatamente.
3. **Persistência no Neon PostgreSQL:**
   - Gravação dos leads e das análises em tabelas relacionais separadas (`leads` e `analises`).
   - Suporte a integridade referencial com `ON DELETE CASCADE` e índices de performance em `lead_id` e `created_at`.
4. **Painel de Monitoramento & Gestão:**
   - Listagem em tempo real de leads cadastrados e suas avaliações.
   - Badges visuais por temperatura do lead e botão para copiar a resposta sugerida com 1 clique.
5. **Segurança Rigorosa de Dados:**
   - Variáveis sensíveis isoladas em `.env` e protegidas pelo `.gitignore`.
   - Validação bidirecional com **Zod** (dados de entrada e resposta estruturada da IA).

---

## 🌟 Funcionalidades Avançadas (Fase 2 - 100% Concluída)

1. **🔐 Login Simples para o Painel:**
   - Proteção de acesso ao painel de leads com autenticação via cookies `HttpOnly` (`admin` / `leadscore2026`).
   - Sessão segura com expiração de 24h e suporte a encerramento de sessão (Logout).
2. **🎯 Filtros Avançados & Busca Dinâmica:**
   - Filtro por temperatura (**Todos**, **Quentes**, **Mornos**, **Frios**).
   - Intervalo de datas com seletores e atalhos de clique rápido (**Hoje**, **Últimos 7 dias**, **Últimos 30 dias**).
   - Busca em tempo real por nome, e-mail, empresa ou segmento do lead.
3. **📊 Gráfico de Distribuição por Classificação:**
   - Gráfico de Rosca (Donut SVG) interativo e nativo com percentual de cada categoria.
   - Barra de proporção contínua e cálculo dinâmico da média geral de pontuação (Score Médio).
4. **🔄 Reanálise de Lead com Histórico Completo:**
   - Botão para reavaliar qualquer lead sob demanda utilizando a API do Google Gemini (`gemini-3.8-flash`).
   - Preservação integral do histórico: novas análises são salvas na tabela `analises` associadas ao `lead_id`.
   - Acordeom expansível exibindo avaliações anteriores com data, modelo, score e justificativa.
5. **⚙️ CI no GitHub Actions com Lint e Build:**
   - Pipeline automatizada de Integração Contínua (`.github/workflows/ci.yml`) configurada no repositório.
   - Disparo automático em todos os `push` e `pull_request` direcionados à branch `main`.
   - Execução isolada em container Ubuntu com Node.js 20, validação estrita do ESLint (`npm run lint`) e compilação de produção (`npm run build`).
6. **📥 Exportação dos Leads em CSV:**
   - Botão de exportação instantânea no painel com contagem dinâmica dos registros filtrados.
   - Exportação compatível com Excel e Google Sheets via formatação RFC 4180 e codificação UTF-8 com BOM (`\uFEFF`).
   - Rota de API dedicada `GET /api/leads/export` protegida por autenticação para download de relatórios.

---

## 🛠️ Stack Tecnológica

- **Framework Web:** [Next.js](https://nextjs.org/) (App Router, Server Components e React 19)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) em modo estrito
- **Banco de Dados:** [Neon PostgreSQL](https://neon.tech/) Serverless
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) com Neon HTTP Driver
- **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/) via SDK oficial `@google/genai` (Modelo: `gemini-3.8-flash`)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Validação de Schemas:** [Zod](https://zod.dev/)
- **Hospedagem & Deploy:** [Vercel](https://vercel.com/)
- **Pair Programming & Automação:** [Google Antigravity](https://deepmind.google/)

---

## 🗄️ Modelo de Dados (Neon PostgreSQL)

O banco de dados utiliza duas tabelas desacopladas para preservar o histórico e permitir reanálises futuras:

```sql
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  empresa     TEXT,
  segmento    TEXT,
  mensagem    TEXT NOT NULL,
  origem      TEXT DEFAULT 'site',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE analises (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id            UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score              INT CHECK (score BETWEEN 0 AND 100),
  classificacao      TEXT CHECK (classificacao IN ('quente','morno','frio')),
  justificativa      TEXT,
  resposta_sugerida  TEXT,
  modelo             TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- Índices de consulta e ordenação
CREATE INDEX idx_analises_lead_id ON analises(lead_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_analises_created_at ON analises(created_at);
```

---

## ⚙️ Configuração e Execução Local

### 1. Pré-requisitos
- Node.js `v20+` ou `v24+`
- Conta e projeto no Neon PostgreSQL
- Chave de API do Google Gemini Studio

### 2. Clonar e Instalar Dependências
```bash
git clone https://github.com/guinunesfcb/leadscore-ia.git
cd leadscore-ia
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha suas chaves:
```bash
cp .env.example .env.local
```

Conteúdo de `.env.example`:
```env
DATABASE_URL=postgresql://usuario:senha@host/banco
GEMINI_API_KEY=adicione-sua-chave
GEMINI_MODEL=gemini-3.8-flash
GEMINI_TIMEOUT_MS=15000
```

### 4. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## 🤖 Relatório de Uso do Google Antigravity

O agente **Google Antigravity** atuou como par de programação sênior durante todo o ciclo de vida do projeto:

1. **Inspeção e Governança de Ambiente:**
   - Auditoria de versões do Node, Git, GitHub CLI e Vercel CLI.
   - Aplicação de regras estritas de segurança para prevenir vazamento de credenciais em commits ou documentação.
2. **Autonomia Controlada com Neon MCP:**
   - Inspeção de branches e projetos existentes diretamente via protocolo MCP.
   - Apresentação prévia do script DDL com avaliação de impacto e verificação de conflitos antes de submeter ao banco.
   - Execução transacional segura do SQL sem necessidade de ferramentas externas ou terminal local exposto.
3. **Arquitetura Full Stack Resiliente:**
   - Utilização do SDK oficial `@google/genai` com schemas estruturados (`responseJsonSchema`) e validação rigorosa com Zod.
   - Separação adequada entre Server Components e Client Components no Next.js App Router.
   - Tratamento de timeout configurável (`GEMINI_TIMEOUT_MS`) e proteção de dados sensíveis em logs.

