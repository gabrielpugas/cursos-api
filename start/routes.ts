/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import ImageKit = require('imagekit');

const imagekit = new ImageKit({
  urlEndpoint: "https://ik.imagekit.io/pugascursos",
  publicKey: "public_9NM+XLBChFAPYWaBaxTSwn5M8KQ=",
  privateKey: "private_lhenqPmn7Jn2zE2hSM39jdc8wo8="
})

Route.get('/auth', ()=>{
  return imagekit.getAuthenticationParameters();
})

//====================================
//ROTAS DO ALUNO
Route.group(() => {
    Route.get('/cursos', 'AlunoController.getCursos');
    Route.get('/curso/:id', 'AlunoController.getCurso');
    Route.get('/curso/aula/:id', 'AlunoController.getCursoAula');
    Route.get('/aula/:id', 'AlunoController.getAula');
    Route.post('/aula/visualizacao', 'AlunoController.setVisualizacao')
    Route.post('/comentar', 'AlunoController.comentar');
    Route.post('/suporte', 'AlunoController.solicitarSuporte');
    Route.post('/responder_atividade', 'AlunoController.responderAtividade');
    Route.get('/atividade/:aula', 'AlunoController.getResultadoAtividade');
    Route.get('/certificado/:id', 'AlunoController.getCertificado');
}).prefix('/aluno').middleware('auth:aluno');

//ROTAS DO INSTRUTOR
Route.group(() => {
  Route.get('/cursos', 'InstrutorController.getCursos');
  Route.get('/curso/:id', 'CursoController.get');
  Route.post('/curso', 'CursoController.criar');
  Route.post('/curso/:id', 'CursoController.editar');
  Route.delete('/curso/:id', 'CursoController.deletar');

  Route.post('/modulo', 'ModuloController.criar');
  Route.post('/modulo/:id', 'ModuloController.editar');
  Route.delete('/modulo/:curso/:id', 'ModuloController.deletar');

  Route.get('/aula/:id', 'AulaController.get');
  Route.post('/aula/imagem', 'AulaController.salvarImagem');
  Route.post('/aula/video', 'AulaController.salvarVideo');
  Route.post('/aula/', 'AulaController.criar');
  Route.post('/aula/:id', 'AulaController.editar');
  Route.delete('/aula/:id', 'AulaController.deletar');

  Route.get('/aula/:id/atividades', 'AtividadeController.get');
  Route.post('/atividade', 'AtividadeController.criar');
  Route.post('/atividade/:id', 'AtividadeController.editar');
  Route.delete('/atividade/:id', 'AtividadeController.deletar');

  Route.post('/opcao', 'OpcaoController.criar');
  Route.post('/opcao/:id', 'OpcaoController.editar');
  Route.delete('/opcao/:id', 'OpcaoController.deletar');

  /* Route.post('/aula/video', 'AulaController.salvarVideo');
   Route.post('/aula/foto-capa', 'AulaController.salvarThumbnail');
 */
   Route.post('/lancamento/modulo/:id', 'LancamentoController.modulo');
   Route.delete('/lancamento/modulo/:id', 'LancamentoController.removerModulo');
   Route.post('/lancamento/aula/:id', 'LancamentoController.aula');
   Route.delete('/lancamento/aula/:id', 'LancamentoController.removerAula');
   Route.get('/lancamento/modulo/:id', 'LancamentoController.getStatusModulo');

   Route.get('/matriculas/curso/:id', 'CursoController.matriculados');
   Route.post('/matricula', 'MatriculaController.create');
   Route.delete('/matricula/:id', 'MatriculaController.delete');


   Route.get('/curso/aula/:id', 'InstrutorController.getCursoAula');
   Route.get('/visualizacao/aula/:id', 'InstrutorController.getAula');
   Route.post('/comentar', 'InstrutorController.comentar');   
   Route.get('/aula/:id/visualizacoes', 'AulaController.getVisualizacoes');
   Route.get('/curso/:id/visualizacoes', 'CursoController.getVisualizacoes');
}).middleware('auth:instrutor').prefix('/instrutor');

//ROTAS DO ADMIN
Route.group(() => {
  Route.get('/usuarios', 'UsuarioController.getAll');
  Route.post('/usuario', 'UsuarioController.criar');
  Route.delete('/usuario/:id', 'UsuarioController.deletar');
  Route.post('/acesso', 'UsuarioController.concederAcesso');
  Route.delete('/acesso/:id/:acesso', 'UsuarioController.revogarAcesso');

  Route.get('/cursos-select', 'CursoController.getSelect');

  Route.get('curso/:id/matriculas', 'CursoController.getMatriculas');
}).middleware(['auth:admin']).prefix('/admin');

//ROTAS DO USUÁRIO
Route.group(() => {
  Route.get('/perfil', 'UsuarioController.get');
  Route.post('/perfil', 'UsuarioController.editar');
  Route.post('/senha', 'UsuarioController.trocarSenha');
  Route.post('/imagem', 'UsuarioController.salvarFotoPerfil');
}).prefix('/usuario').middleware('auth');

Route.post('/login', 'UsuarioController.login');
Route.post('/forgot-password', 'UsuarioController.esqueceuASenha');
Route.post('/reset-password', 'UsuarioController.restaurarSenha');
Route.post('/webhook', 'WebhookController.processar');