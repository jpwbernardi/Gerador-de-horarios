/* Arquivo:   ClassList.js
   Autores:   Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler
              Bernardi, Matheus Henrique Trichez e Vladimir Belinski
   Descrição: o presente arquivo faz parte do projeto Gerador de Horários, no qual é criada uma aplicação que visa ser uma ferramenta
              facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do
              Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de
              professores, componentes curriculares, associações, restrições e a montagem das grades de 10 fases de um curso para os turnos
              matutino, vespertino e noturno;
              * 'ClassList.js' corresponde ao arquivo JavaScript que contém as classes, atributos e métodos responsáveis pela representação
              em memória da lista de associações da grade salvas no banco de dados.
*/

class ClassNode {
  constructor(classRow) {
    this.prev = null;
    this.row = classRow;
    this.next = null;
  }

  equalsRow(classRow) {
    if (typeof classRow === typeof undefined || classRow === null) {
      throw new ReferenceError("Cannot compare to undefined or null");
    }
    return this.row.counter === classRow.counter;
  }

  equals(other) {
    return this.equalsRow(other.row);
  }
}

class ClassList {
  constructor(blockNumber, headCounter, tailCounter) {
    if (typeof blockNumber !== typeof undefined && typeof headCounter !== typeof undefined && typeof tailCounter !== typeof undefined) {
      this._blockNumber = blockNumber;
      this._headCounter = headCounter;
      this._tailCounter = tailCounter;
    } else {
      throw new TypeError("All three constructor parameters are mandatory.");
    }
    this._length = 0;
    this._head = null;
    this._tail = null;
  }

  get blockNumber() {
    return this._blockNumber;
  }

  get head() {
    return this._head;
  }

  get headCounter() {
    return this._headCounter;
  }

  get tail() {
    return this._tail;
  }

  get tailCounter() {
    return this._tailCounter;
  }

  get length() {
    return this._length;
  }

  isEmpty() {
    return this._length === 0;
  }

  /** @method eachRow
   * @param callback a função a ser invocada para
   * cada {@code node.row} da lista. Retorna
   * imediatamente, sem invocar a função passada
   * como parâmetro, se a lista estiver vazia.
   * @throws {TypeError} se o parâmetro passado
   * não for uma função.
   */
  eachRow(callback) {
    if (typeof callback !== "function")
      throw new TypeError(callback + " is not a function");
    if (this.isEmpty()) return;
    let node = this.head;
    while (node !== null) {
      callback.call(callback, node.row);
      node = node.next;
    }
  }

  getNodeAt(index) {
    if (this.isEmpty()) return null;
    if (index < 0 || index >= this._length)
      throw new RangeError("Index out of bounds. Current length is " + this._length);
    let cursor = 0;
    let node = this.head;
    while (cursor < index) {
      cursor++;
      node = node.next;
    }
    return node;
  }

  getRowAt(index) {
    let nodeAt = this.getNodeAt(index);
    if (nodeAt !== null) return nodeAt.row;
    return null;
  }

  findCounterFrom(node, classCounter) {
    if (node == null) return null;
    if (node.row.counter == classCounter) return node;
    return this.findCounterFrom(node.next, classCounter);
  }

  findCounter(classCounter) {
    if (classCounter === null || typeof classCounter === typeof undefined) return null;
    return this.findCounterFrom(this._head, classCounter);
  }

  find(classNode) {
    return this.findRow(classNode.row);
  }

  push(node) {
    if (this._tail == null) {
      this._head = this._tail = node;
    } else {
      node.prev = this._tail;
      node.next = null;
      this._tail.next = node;
      this._tail = node;
    }
    this._length++;
    return node;
  }

  pushRow(classRow) {
    let classNode = new ClassNode(classRow);
    return this.push(classNode);
  }

  insertBefore(node, nodeAfter) {
    if (nodeAfter == null) return this.push(node);
    node.next = nodeAfter;
    node.prev = nodeAfter.prev;
    if (nodeAfter.prev !== null) nodeAfter.prev.next = node;
    else this._head = node;
    nodeAfter.prev = node;
    this._length++;
    return node;
  }

  insertRowBefore(classRow, rowAfter) {
    let classNode = new ClassNode(classRow);
    let nodeAfter = this.findRow(rowAfter);
    return this.insertBefore(classNode, nodeAfter);
  }

  insertCounterBefore(classCounter, theCounterAfter) {
    let classNode = this.findCounter(classCounter);
    let theNodeAfter = this.findCounter(theCounterAfter);
    return this.insertBefore(classNode, theNodeAfter);
  }

  remove(node) {
    if (node === null) return;
    if (this._head.equals(node)) this._head = node.next;
    if (this._tail.equals(node)) this._tail = node.prev;
    if (node.next !== null) node.next.prev = node.prev;
    if (node.prev !== null) node.prev.next = node.next;
    node.prev = node.row = node.next = null;
    this._length--;
  }

  removeCounter(classCounter) {
    this.remove(this.findCounter(classCounter));
  }
}

module.exports = ClassList;
