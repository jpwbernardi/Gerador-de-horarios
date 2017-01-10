class ClassNode {
  constructor(classRow) {
    this.prev = null;
    this.row = classRow;
    this.next = null;
  }

  equalsRow(classRow) {
    if (typeof classRow === typeof undefined || classRow === null) {
      throw new ReferenceError("Cannor compare to undefined or null");
    }
    return this.row.counter === classRow.counter;
  }

  equals(other) {
    return this.equalsRow(other.row);
  }
}

class ClassList {
  constructor() {
    this._length = 0;
    this._head = null;
    this._tail = null;
  }

  get head() {
    return this._head;
  }

  get tail() {
    return this._tail;
  }

  get length() {
    return this._length;
  }

  isEmpty() {
    return this._length === 0;
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

  findRowFrom(node, classRow) {
    if (node == null) return null;
    if (node.equalsRow(classRow)) return node;
    return this.findRowFrom(node.next, classRow);
  }

  findRow(classRow) {
    return this.findRowFrom(this._head, classRow);
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
    let nodeAfter = findRow(rowAfter);
    return this.insertBefore(classNode, nodeAfter);
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

  removeRow(classRow) {
    this.remove(this.findRow(classRow));
  }
}

module.exports = ClassList;
