# Gerador-de-horarios

Alunos: Acácia, Davi, Gabriel, Harold, João Pedro, Matheus e Vladimir

Cliente: Marco (coordenador do curso)

Projeto: Gerador automático dos horários do semestre


- Funcionaria como um facilitador para geração dos horários do semestre (em relação aos componentes curriculares).
- Poderia gerar os horários automaticamente ou possibilitar que o usuário monte manualmente os horários, nesse caso apresentando uma interface gráfica onde os componentes podem ser arrastados a "espaços disponíveis no horário".
- Apresentar as possibilidades de encaixe dos componentes de maneira visual ao usuário (alterando a cor dos espaços possíveis para o componente selecionado).
- Respeitar restrições da universidade (matérias de tronco comum, questões de turnos em que um professor pode estar em sala...).
- Respeitar limitações individuais dos professores.
- Priorizar a quebra dos componentes (para um componente não ocupar um turno inteiro).

- O software não é voltado para a grade de horários dos alunos individualmente.
- O software não tem relação com horários de ônibus, ou vans, ou afins.

# Para gerar o executável para o cliente:

Dependências:
- asar: npm install -g asar;
- Última versão do Electron: http://electron.atom.io/releases/ (baixar o zip linux-x64 e extraí-lo numa pasta com o nome do projeto).

Passos:
- Comentar a linha de abrir o console no arquivo main.js: mainWindow.webContents.openDevTools();
- Copiar todos os arquivos para uma pasta chamada 'app', exceto as pastas doc/, node_modules/electron* e o scheduler.db;
- Ainda na pasta recém criada, deletar os executáveis node_modules/.bin/electron*;
- Empacotar a pasta recém criada: asar pack app app.asar
- Copiar o arquivo app.asar para onde o zip do Electron foi extraído, dentro de resources/ (ao lado dos arquivos electron.asar e default_app.asar);
- Copiar o scheduler.db para a raiz do zip extraído (ao lado do executável do Electron);
- Renomear o executável 'electron' para 'Gerador de horários';
- Entregar.
