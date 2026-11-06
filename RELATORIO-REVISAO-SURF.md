# Relatório de revisão – Sistema de agendamento de aulas de surf

**Data:** 06/11/2026
**Projetos analisados:**
- API: `C:\Web-Surf-Api\WebApiSurfSchool` (.NET 8 + EF Core + PostgreSQL/Neon)
- Front: `C:\Surf-School\surf-agenda` (React 19 + Vite + Tailwind 3 + React Query)
- Produção: gosurfce.com.br e front-surf-school.pages.dev

---

## 0. Situação atual (leia primeiro)

- As correções de **segurança** (seção 2) **já foram feitas** no código, numa branch chamada **`seguranca`** nos dois repositórios.
- **Ainda não há commit, push nem deploy.** As alterações estão só no disco do computador. Elas continuam lá mesmo trocando de conta do Claude.
- **A produção continua vulnerável** até o deploy da API e do front novos (seção 7).
- A API compila e o front gera o build. Os fluxos foram testados num Postgres local descartável, sem tocar no banco do Neon (seção 6).

Para conferir:

```bash
cd C:\Web-Surf-Api\WebApiSurfSchool
git status
git diff
```

```bash
cd C:\Surf-School
git status
git diff
```

---

## 1. Resumo por prioridade

| # | Problema | Gravidade | Status |
|---|---|---|---|
| S1 | Rotas de admin sem login | 🔴 Crítica | ✅ Corrigido |
| S2 | Login do admin com e-mail + data de nascimento | 🔴 Crítica | ✅ Corrigido |
| S3 | Proteção do painel no front era só `localStorage` | 🔴 Crítica | ✅ Corrigido |
| S4 | Admin de uma escola acessava dados de outra | 🔴 Crítica | ✅ Corrigido |
| S5 | Qualquer pessoa cancelava a aula de outra pelo ID | 🔴 Crítica | ✅ Corrigido |
| S6 | Consulta pública devolvia a agenda inteira (nomes e telefones) | 🟠 Alta (LGPD) | ✅ Corrigido |
| S7 | `.env` e connection string versionados no Git | 🔴 Crítica | ✅ Removidos do Git · ⚠️ **falta trocar a senha no Neon** |
| S8 | Chave do JWT de exemplo e configuração com nomes errados | 🔴 Crítica | ✅ Corrigido · ⚠️ falta configurar na hospedagem |
| S9 | Swagger exposto (Docker em modo Development) | 🟡 Média | ✅ Corrigido |
| S10 | Sem limite de tentativas no login | 🟠 Alta | ✅ Corrigido |
| S11 | Seed cria admin com senha `123456` | 🟠 Alta | ⚠️ Pendente: definir senhas novas após o deploy |
| N1 | Overbooking (duas pessoas na última vaga) | 🟠 Alta | ✅ Corrigido |
| N2 | Saldo do pacote descontado antes de salvar | 🟠 Alta | ✅ Corrigido |
| N3 | Reconfirmação pelo admin não checava vagas nem descontava o saldo | 🟠 Alta | ✅ Corrigido |
| N4 | Cancelamentos simultâneos devolviam a aula duas vezes | 🟡 Média | ✅ Corrigido |
| N5 | Regra 06:00/08:00 e fuso fixos no código | 🟡 Média | ⏳ Pendente |
| N6 | Migrations quebram num banco novo | 🟡 Média | ⏳ Pendente |
| N7 | Exceções vazam `ex.Message` nas respostas | 🟢 Baixa | ⏳ Pendente |
| V1–V9 | Visual | — | ⏳ Pendente (seção 4) |
| R1–R5 | Responsividade iOS/Android | — | ⏳ Pendente (seção 5) |

---

## 2. Segurança (corrigido na branch `seguranca`)

### S1 – Rotas de admin sem autenticação
**Problema:** nenhuma rota do `AdminController` tinha `[Authorize]`. No `EscolinhasController`, só a `Desligar` tinha. Com o Postman, qualquer pessoa conseguia:
- dar aulas de pacote para si mesma (`/Admin/Atualizar-Saldo`);
- cancelar ou confirmar qualquer agendamento;
- ver nome e telefone de todos os alunos;
- alterar regras e horários e bloquear agenda;
- cadastrar escolas novas.

**Correção:**
- `[Authorize(Roles = "Admin")]` em todas as rotas de admin: `AdminController`, `Agenda/Dia`, `Agendamento/IdAgendamento`, e `Atualizar`, `Salvar-Regras`, `Obter-Regras`, `Bloquear-Horario` e `Desbloquear-Horario` do `EscolinhasController`.
- `[Authorize(Roles = "SuperAdmin")]` em `Escolinhas/Cadastrar`, `Ativar`, `Desligar` e `listar`. Nenhum usuário tem esse perfil ainda, então essas rotas ficam desligadas até existir um painel do dono da plataforma.
- `Alunos/Atualizar/Aluno` (troca de telefone, que permitia "roubar" o pacote de alguém) passou a ser `Admin/Atualizar-Telefone-Aluno`, só para admin.

### S2 – Login com e-mail + data de nascimento
**Problema:** o front chamava `/Admin/Usuario` com e-mail e data de nascimento. O campo `SenhaHash` existia no banco, mas não era usado. Data de nascimento é fácil de descobrir.

**Correção:**
- O login passa a ser `POST /AdminAuth/login` com `{ idEscolinha, email, senha }`, verificado com BCrypt (`workFactor 12`).
- A mensagem de erro é sempre a mesma ("E-mail ou senha inválidos"), e o tempo de resposta é igual mesmo quando o e-mail não existe. Assim não dá para descobrir quais e-mails estão cadastrados.
- A rota `/Admin/Usuario`, o `UsuarioService` e o `UsuarioRepository` foram removidos.
- Novo comando para definir ou trocar a senha de um admin. Ele pede a senha sem mostrar na tela, exige no mínimo 8 caracteres e derruba as sessões abertas desse admin:
  ```bash
  dotnet run -- definir-senha email@doadmin.com slug-da-escola
  ```

### S3 – Proteção falsa do painel no front
**Problema:** o `AdminGuard` só checava um JSON no `localStorage`. Dava para entrar no painel digitando no console do navegador:
```js
localStorage.setItem('admin_session', '{"idUsuario":1,"ativo":true}')
```
O JWT com refresh token, que já estava implementado na API, nunca era usado pelo front.

**Correção:**
- O front guarda o token de acesso (JWT) e o envia em todas as chamadas.
- Se uma chamada recebe 401, o front renova o token sozinho pelo cookie HttpOnly e repete a chamada.
- Se a renovação falhar, o front manda o admin para a tela de login.
- O guard confere se o token é da escola que está aberta.
- "Sair" chama `/AdminAuth/logout`, que revoga o refresh token.
- Arquivos: `services/api.js`, `services/adminAuth.js`, o novo `services/sessaoAdmin.js`, `components/AdminGuard.jsx`, `pages/AdminLogin.jsx` (agora com campo de senha e botão mostrar/ocultar) e `app/App.jsx`.

### S4 – Isolamento entre escolas (multi-tenant)
**Problema:** o `IdEscolinha` vinha do corpo da requisição. Mesmo logado, um admin podia mexer em outra escola só trocando esse número.

**Correção:**
- O token agora carrega o claim `id_escolinha`.
- Nas rotas de admin, o `IdEscolinha` é sempre lido do token com `User.ObterIdEscolinha()`, no novo arquivo `Infra/Security/ClaimsUsuario.cs`. O valor enviado no corpo é ignorado.
- Agendamentos buscados por ID passam a ser filtrados pela escola do token.

### S5 – Cancelar a aula de outra pessoa
**Problema:** `/Agendamento/Cancelar` era público e só pedia `IdAgendamento`, que é um número sequencial (1, 2, 3…). Além disso, `/Agendamento/IdAgendamento` devolvia nome, telefone e código de qualquer reserva.

**Correção:**
- O cancelamento pelo aluno exige o **telefone da reserva**, e o front já envia.
- A API responde "não encontrado" tanto quando o ID não existe quanto quando o telefone não confere, para não revelar quais IDs existem.
- `/Agendamento/IdAgendamento` passou a ser só para admin.

**Limitação que continua:** o telefone ainda é a "senha" do aluno. Quem souber o telefone de alguém consegue ver e cancelar as aulas dessa pessoa. O ideal é confirmar por um código enviado no WhatsApp (seção 8).

### S6 – Vazamento de dados (LGPD)
**Problema:** `/Agendamento/Aluno` e `/Alunos/ListaAgendamentos/Aluno`, chamados sem telefone, devolviam todos os agendamentos do dia, com nomes e telefones.

**Correção:** o telefone passou a ser obrigatório nas consultas públicas. O telefone também é normalizado: a API fica só com os dígitos e aceita de 10 a 13.

### S7 – Segredos no Git
**Problema:** o `.env` (com a connection string do Neon) e o `appsettings.json` (com a connection string) estavam versionados no GitHub (`carlosandregit/ApiSurfSchool`).

**Correção:**
- O `.env` saiu do Git com `git rm --cached`. O arquivo continua existindo no disco.
- O `.gitignore` e o `.dockerignore` agora ignoram `.env*`.
- O valor de `DefaultConnection` no `appsettings.json` ficou vazio.
- Novo `.env.example` como modelo.
- A API lê o `.env` local quando ele existe (`Infra/ArquivoEnv.cs`) e também aceita `NEON_CONNECTION_STRING`.

**⚠️ Você precisa fazer:** **troque a senha do banco no Neon.** A senha antiga continua no histórico do Git, então removê-la do arquivo não basta.

### S8 – Configuração do JWT
**Problema:**
- A chave era o texto de exemplo `COLOQUE_UMA_CHAVE_GRANDE...`.
- A classe esperava `Usuario`, mas o JSON usava `Emissor`, então o emissor (issuer) do token ficava nulo.
- A validade estava fixa em 150 minutos, ignorando a configuração.

**Correção:**
- `ConfiguracoesJwt` agora tem `Emissor`, `Audiencia`, `Chave`, `MinutosExpiracaoTokenAcesso` (60) e `DiasExpiracaoTokenAtualizacao` (14).
- **Em produção, a API não sobe sem uma chave de pelo menos 32 caracteres.** Isso foi testado.
- Em desenvolvimento, a API gera uma chave temporária a cada vez que sobe.

### S9 – Swagger exposto
**Problema:** o `docker-compose.yml` rodava com `ASPNETCORE_ENVIRONMENT: Development`, o que deixa o Swagger público. A variável `DefaultConnection` também tinha o nome errado.

**Correção:** o Docker agora roda em `Production`, com `ConnectionStrings__DefaultConnection` e `Jwt__Chave` vindos de variáveis de ambiente.

### S10 – Força bruta no login
**Correção:** limite por IP, em `Infra/Security/LimitesRequisicao.cs`:
- login: 5 tentativas por minuto;
- rotas públicas de reserva, cancelamento e consulta: 30 por minuto.

O IP real do visitante vem do proxy pelo `X-Forwarded-For` (`UseForwardedHeaders`).

### S11 – Senha padrão do seed
**Problema:** o `SeedInicial.cs` cria `admin@surfschool.com` com a senha `123456`. Se a produção usou esse seed, essa senha passa a valer quando o login novo for ao ar.

**⚠️ Você precisa fazer:** logo após o deploy, rode `definir-senha` para **cada admin**.

---

## 3. Regras de negócio

### ✅ Corrigido
Tudo em `Services/IAgendamentoService.cs`.

- **N1 – Overbooking.** A API contava as vagas e depois inseria, sem transação. Agora a reserva roda numa transação com trava por horário (`pg_advisory_xact_lock`). No teste com 10 reservas simultâneas na última vaga, entrou exatamente 1.
- **N2 – Saldo do pacote.** O desconto agora é um `UPDATE ... WHERE saldo > 0` atômico, na mesma transação da reserva. Se a reserva falhar, o saldo não é descontado.
- **N3 – Reconfirmação pelo admin.** Agora confere as vagas, confere se já existe reserva duplicada e desconta a aula do pacote de novo.
- **N4 – Cancelamento duplicado.** O cancelamento é um `UPDATE` condicional (só se ainda estiver `CONFIRMADO`) e o estorno acontece na mesma transação. No teste com 5 cancelamentos simultâneos, a aula foi devolvida 1 vez. Agendamentos antigos sem `IdAluno` continuam sendo estornados pelo telefone, como antes.
- **Validações novas na reserva:** nome entre 2 e 150 caracteres, horário em formato válido e telefone com DDD.

### ⏳ Pendente

**N5 – Regra fixa no código.** O `ObterDataLimiteCancelamento` trata 06:00 e 08:00 de forma especial direto no código, e o fuso `America/Fortaleza` também está fixo. Para vender para outras escolas:
- crie as colunas `FusoHorario` em `Escolinha` e `CancelamentoNoDiaAnterior` (que já existe) em cada horário, configuráveis pelo admin;
- remova a comparação com 06:00/08:00 do código.

**N6 – Migrations quebradas.** A migration `20260317005359_AddRegraCancelamentoHorarioEscolinha` faz de novo `ADD COLUMN "LimiteVagas"`, que a migration anterior já criou. Num banco novo, o `Migrate()` falha. Em produção não afeta, porque o banco já existe.
- **Sugestão:** gere uma migration "baseline" limpa a partir do modelo atual para bancos novos, sem mexer no histórico de produção. Outra opção é tornar a operação idempotente com `ADD COLUMN IF NOT EXISTS` via `migrationBuilder.Sql`.

**N7 – Erros internos expostos.** Vários `catch` devolvem `ex.Message` para o cliente.
- **Sugestão:** um middleware global de exceções (`UseExceptionHandler` + `ProblemDetails`) que registra o erro no log e responde com uma mensagem genérica.

**Outras melhorias de código:**
- Trocar os textos soltos `"CONFIRMADO"`, `"PACOTE"` etc. por enums ou constantes.
- Usar verbos REST (GET para consultas) em vez de POST para tudo.
- Os arquivos `Services/I*.cs` guardam a interface e a implementação juntas; vale separar.
- Corrigir os warnings de nullability.
- Criar testes automatizados (xUnit + Testcontainers Postgres) para reserva, cancelamento e saldo.

---

## 4. Visual (pendente)

- **V1 – Identidade da escola não usada.** `CorPrimaria`, `CorSecundaria` e `UrlLogo` existem no banco, mas o front não usa: a logo está comentada no header e as cores `sky`/`slate` estão fixas.
  - **Sugestão:** variáveis CSS (`--cor-primaria`) aplicadas a partir de `Obter-Configuracao` e Tailwind configurado para usá-las.
- **V2 – Excesso de emoji** (🏄🌊🔒✅) passa uma cara de amador.
  - **Sugestão:** ícones da biblioteca `lucide-react`.
- **V3 – Carregamento e erro sem tratamento visual** ("Carregando escolinha...").
  - **Sugestão:** skeletons e estados vazios ou de erro com ilustração e botão "tentar novamente".
- **V4 – Datas cruas.** Aparece `2026-11-05` no modal de confirmação e no cancelamento.
  - **Sugestão:** formatar como "Qui, 06 de nov · 16:00".
- **V5 – Dá para navegar para dias passados** na agenda.
  - **Sugestão:** bloquear datas anteriores a hoje e trocar as setas por um carrossel com os 7 próximos dias.
- **V6 – "PACOTE / AVULSA" num `select`** é confuso para o aluno.
  - **Sugestão:** dois cards de escolha com explicação ("Uso aula do meu pacote" / "Aula avulsa").
- **V7 – Link "Admin" visível** para todos os alunos.
  - **Sugestão:** mostrar só para quem está logado; o admin acessa pela URL `/slug/admin`.
- **V8 – Sobras do template do Vite:** `src/App.jsx`, `src/App.css`, `src/assets/react.svg`, `public/vite.svg` e as diretivas `@tailwind` duplicadas no `index.css`.
- **V9 – `index.html`:** `lang="en"`, título "gosurf" e favicon do Vite.
  - **Sugestão:** `lang="pt-BR"`, título com o nome da escola e favicon próprio.

**Arquivo grande:** o `pages/Admin.jsx` tem 778 linhas. Vale quebrar em componentes: agenda do dia, cadastro de aluno, saldo e bloqueio de horários.

---

## 5. Responsividade iOS / Android (pendente)

- **R1 – Header estoura no celular.** Logo + 3 links + "Sair" não cabem numa tela de 375px.
  - **Sugestão:** header só com a logo e uma barra de navegação inferior fixa, no estilo de app.
- **R2 – Bottom sheets sem safe area.** No iPhone, o botão "Confirmar" fica embaixo da barra de gestos.
  - **Sugestão:** `padding-bottom: env(safe-area-inset-bottom)` e `viewport-fit=cover` no meta viewport.
- **R3 – Teclado cobre o formulário.** Os sheets não têm altura máxima nem rolagem.
  - **Sugestão:** `max-h-[90dvh] overflow-y-auto` e usar `dvh` em vez de `vh`.
- **R4 – Não é PWA.** Não dá para "instalar" na tela inicial.
  - **Sugestão:** `manifest.webmanifest`, ícones 192/512, `theme-color`, `apple-touch-icon` e `vite-plugin-pwa`.
- **R5 – Cookie de renovação no Safari.** Se a API e o site estiverem em domínios diferentes, o iOS bloqueia o cookie e o admin precisa logar de novo a cada 60 minutos.
  - **Sugestão:** colocar a API num subdomínio do site, como `api.gosurfce.com.br`.

**Ponto positivo:** os inputs já usam `text-[16px]`, o que evita o zoom automático do iPhone.

**Caminho recomendado:** site 100% responsivo + PWA primeiro. Depois, se as escolas pedirem, publicar nas lojas com Capacitor reaproveitando o mesmo código. A conta de desenvolvedor da Apple custa US$ 99 por ano.

---

## 6. Testes feitos

Ambiente: Postgres 17 local descartável, criado na pasta temporária e já desligado. **O Neon não foi usado.**

| Teste | Esperado | Resultado |
|---|---|---|
| Rotas de admin sem token | 401 | ✅ 401 |
| `/Admin/Usuario` antigo | 404 | ✅ 404 |
| Login com data de nascimento | 400 | ✅ 400 |
| Senha errada ou escola errada | 401 | ✅ 401 |
| Admin B lendo aluno da escola A (mandando `idEscolinha=1`) | 404 | ✅ 404 |
| Admin comum em rota SuperAdmin | 403 | ✅ 403 |
| Token adulterado | 401 | ✅ 401 |
| Renovação do token por cookie | 200 | ✅ 200 |
| Pacote sem saldo | 400 | ✅ 400 |
| 10 reservas simultâneas na última vaga | 1 aceita | ✅ 1 aceita |
| Cancelar com telefone errado ou sem telefone | 404 / 400 | ✅ |
| Admin B cancelando reserva da escola A | 404 | ✅ 404 |
| 5 cancelamentos simultâneos | estorno 1 vez | ✅ saldo correto |
| Reconfirmação pelo admin | desconta o saldo | ✅ |
| 7 tentativas de login seguidas | 429 | ✅ 429 |
| API em Production sem `Jwt__Chave` | não sobe | ✅ |
| Navegador: forjar `admin_session` | volta ao login | ✅ |
| Navegador: login, painel, renovação automática, sair, consulta de saldo do aluno | funcionando | ✅ |

---

## 7. Checklist de deploy

1. [ ] Revisar o `git diff` nos dois repositórios e fazer commit na branch `seguranca`.
2. [ ] **Trocar a senha do banco no Neon.**
3. [ ] Configurar na hospedagem da API:
   - `ConnectionStrings__DefaultConnection` com a nova connection string;
   - `Jwt__Chave` com uma chave aleatória. Para gerar:
     ```bash
     openssl rand -base64 64
     ```
   - `ASPNETCORE_ENVIRONMENT=Production`.
4. [ ] Publicar a API e o front **juntos**. O front antigo não funciona com a API nova.
5. [ ] Logo após o deploy, rodar o comando abaixo para **cada admin**, apontando para o banco de produção:
   ```bash
   dotnet run -- definir-senha <email> <slug>
   ```
6. [ ] Testar em produção: login, reserva, cancelamento e painel do admin.
7. [ ] Opcional: apagar o `.env` do histórico do Git (BFG ou `git filter-repo`). Trocar a senha do banco, no passo 2, já resolve o risco principal.

---

## 8. Próximos passos sugeridos (produto vendável)

1. **Semana 2 – Visual:** itens V1 a V9.
2. **Semana 3 – Mobile:** itens R1 a R5.
3. **Depois:**
   - Confirmação do aluno por código no WhatsApp (resolve a limitação do S5).
   - Lembrete automático da aula pelo WhatsApp.
   - Pagamento Pix (Asaas ou Mercado Pago) para aula avulsa e pacotes.
   - Painel SuperAdmin para cadastrar escolas novas (self-service).
   - Regras de cancelamento e fuso configuráveis por escola (N5).
   - Condições do mar e previsão de ondas na tela de agenda.

---

## 9. Arquivos alterados na branch `seguranca`

### API (`C:\Web-Surf-Api\WebApiSurfSchool`)

**Alterados:**
- `Program.cs`
- `appsettings.json`
- `docker-compose.yml`
- `.gitignore`
- `.dockerignore`
- `WebApiSurfSchool.csproj`
- `Controllers/AdminAuthController.cs`
- `Controllers/AdminController.cs`
- `Controllers/AgendaController.cs`
- `Controllers/AgendamentoController.cs`
- `Controllers/AlunosController.cs`
- `Controllers/EscolinhasController.cs`
- `Dtos/Request/AdminLoginRequest.cs`
- `Dtos/Request/CancelarAgendamentoRequest.cs`
- `Infra/Security/ConfiguracoesJwt.cs`
- `Infra/Security/SenhaHasher.cs`
- `Infra/Security/ServicoTokenJwt.cs`
- `Services/IAgendamentoService.cs`
- `Services/IServicoAuthAdmin.cs`

**Novos:**
- `.env.example`
- `Infra/ArquivoEnv.cs`
- `Infra/Security/ClaimsUsuario.cs`
- `Infra/Security/ComandoDefinirSenha.cs`
- `Infra/Security/LimitesRequisicao.cs`

**Removidos:**
- `Services/IUsuarioService.cs`
- `Repositories/IUsuarioRepository.cs`
- Do Git (o arquivo continua no disco): `.env` e `WebApiSurfSchool.csproj.user`

### Front (`C:\Surf-School\surf-agenda`)

**Alterados:**
- `src/app/App.jsx`
- `src/components/AdminGuard.jsx`
- `src/pages/AdminLogin.jsx`
- `src/pages/MyBookings.jsx`
- `src/services/admin.js`
- `src/services/adminAuth.js`
- `src/services/agendamento.js`
- `src/services/api.js`

**Novo:**
- `src/services/sessaoAdmin.js`

---

## 10. Como continuar numa nova conta do Claude

Abra uma sessão nova com acesso às pastas `C:\Surf-School` e `C:\Web-Surf-Api\WebApiSurfSchool` e cole:

> Leia o arquivo `C:\Surf-School\RELATORIO-REVISAO-SURF.md`. As correções de segurança já estão feitas (sem commit) na branch `seguranca` dos dois repositórios. Revise o diff, me ajude a fazer o commit e o deploy seguindo o checklist da seção 7, e depois vamos para o visual (seção 4) e a responsividade (seção 5).
