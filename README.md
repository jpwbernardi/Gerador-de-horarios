# Gerador-de-horarios

Projeto: Gerador de horários do semestre

Time: Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler Bernardi, Matheus Henrique Trichez e Vladimir Belinski

P.O.: Prof. Marco Aurélio Spohn (coordenador do curso de Ciência da Computação da Universidade Federal da Fronteira Sul - UFFS)

Descrição do projeto:

- O software desenvolvido visa ser uma ferramenta facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de professores, componentes curriculares, associações, restrições de professores, restrições legais e a montagem das grades das 10 fases do curso para os turnos matutino, vespertino e noturno;
- Na montagem da grade os elementos que as comporão podem ser facilmente arrastados para posições sugeridas, facilitando assim o trabalho de quem está realizando a montagem da grade, ao passo que também respeitam as restrições de professores (limitações individuais dos professores) e as restrições legais (da universidade) ativas no momento;
- O software possibilita grande flexibilidade na montagem de horários em relação a disposição de associações pela grade, também possibilitando que o usuário priorize a quebra dos componentes (para um CCR não ocupar um turno inteiro);
- O software não é voltado para a grade de horários dos alunos individualmente, tal como não apresenta relação com horários de transporte.

# Para contribuir com o projeto:

- Instalar o Node.js/npm
  + Via [package manager](https://nodejs.org/en/download/package-manager/) (recomendado)
  + A partir do instalador do [site](https://nodejs.org/en/download/)

- Algumas versões do Ubuntu e derivados têm problemas com os nomes dos executáveis. Caso o `npm install` falhe, pode-se tentar a seguinte solução:

  ```
  sudo ln -s /usr/bin/nodejs /usr/bin/node
  ```

- Executar o comando abaixo como **administrador** - **apenas para Windows** ([fonte](http://stackoverflow.com/questions/21658832/npm-install-error-msb3428-could-not-load-the-visual-c-component-vcbuild-ex#answer-39235952), [mais informações](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md))

  ```
  npm install --global --production windows-build-tools
  ```

  + Adicionar o Python 2 (instalado na pasta `%USERPROFILE%\.windows-build-tools\python27` pelo comando acima) à [PATH](https://www.java.com/en/download/help/path.xml)

- Baixar o [SQLite](http://sqlite.org/download.html) (o pacote de binários pré-compilados e com shell) para executar o `resetdb.sh`
  + Extrair em uma pasta da sua escolha
  + Adicionar ao PATH

- Após clonar o repositório e estando na pasta raiz do projeto, executar:

  ```
  npm install
  ```

  E então, para Linux:

  ```
  ./node_modules/.bin/electron-rebuild
  ```

  Para Windows:

  ```
  .\node_modules\.bin\electron-rebuild.cmd
  mv '.\node_modules\sqlite3\lib\binding\{node_abi}-{platform}-{arch}\' .\node_modules\sqlite3\lib\binding\electron-v1.4-win32-x64\
  ```

- Finalmente, para executar o projeto:

  ```
  npm start
  ```

# Para gerar o executável para o cliente (testado apenas em Linux):

Dependências:
- asar
  ```
  npm install -g asar
  ```

- Última versão do [Electron](http://electron.atom.io/releases/) (baixar o zip linux-x64 e extraí-lo numa pasta com o nome do projeto).

Passos:
- Comentar a linha de abrir o console no arquivo main.js: `mainWindow.webContents.openDevTools()`;
- Copiar todos os arquivos para uma pasta chamada 'app', exceto as pastas `doc/`, `node_modules/electron*` e o `scheduler.db`;
- Ainda na pasta recém criada, deletar os executáveis `node_modules/.bin/electron*`;
- Empacotar a pasta recém criada: `asar pack app app.asar`;
- Copiar o arquivo `app.asar` para onde o zip do Electron foi extraído, dentro de `resources/` (ao lado dos arquivos `electron.asar` e `default_app.asar`);
- Copiar o `scheduler.db` para a raiz do zip extraído (ao lado do executável do Electron);
- Renomear o executável `electron` para `Gerador de horários`;
- Entregar.
