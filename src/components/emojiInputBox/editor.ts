// eslint-disable-next-line @typescript-eslint/no-empty-function
export const None = () => {}

// 光标操作对象
export class Cursor {
  containerEl: HTMLElement
  cursorEl: HTMLElement
  pollyfil: HTMLElement
  isMount: boolean | undefined
  constructor(el: HTMLElement) {
    this.cursorEl = this.createCursor()
    this.pollyfil = this.createPollyfil()
    this.containerEl = el
  }
  /**
   * 创建填充物，用于解决高度塌陷问题
   * @returns Element
   */
  createPollyfil() {
    const wrapSpan = document.createElement('span')
    wrapSpan.style.display = 'inline-block'
    wrapSpan.style.height = '1em'
    return wrapSpan
  }
  mountePollyfil() {
    // 解决无内容时高度塌陷导致的光标无高度问题
    if (this.isMount) {
      this.cursorEl.parentNode?.insertBefore(this.pollyfil, this.cursorEl)
    }
  }
  createCursor() {
    initCursorStyles()
    const wrapSpan = document.createElement('span')
    wrapSpan.className = 'cursor'
    const lineSpan = document.createElement('span')
    lineSpan.className = 'line'
    wrapSpan.appendChild(lineSpan)
    wrapSpan.contentEditable = 'false'
    return wrapSpan
  }
  getCursor() {
    return this.cursorEl
  }
  mounted(isAppend = false) {
    if (!this.containerEl) {
      return
    }
    if (!this.isMount || isAppend) {
      this.containerEl.appendChild(this.cursorEl)
    }
    this.isMount = true

    // 检测是否需要填充
    const childs = this.containerEl.children || []
    if (childs.length < 2) {
      this.mountePollyfil()
    }
  }
  unmounted() {
    this.cursorEl.parentNode?.removeChild(this.cursorEl)
    this.isMount = false
  }
  // 重新聚焦于容器
  focus() {
    if (this.isMount) {
      this.cursorEl.parentElement?.focus()
    } else if (this.containerEl) {
      this.mounted()
      this.containerEl.focus()
    }
  }
  // 在元素(光标)前插入文本
  insertText(str: string, target?: Element | null) {
    if (!target) {
      if (!this.isMount) {
        return
      }
      target = this.cursorEl
    }
    this.insertEl(translateElement(str), target)
  }
  // 在元素(光标)前插入元素
  insertEl(el: Element | DocumentFragment, target?: Element | null) {
    if (!target) {
      if (!this.isMount) {
        return
      }
      target = this.cursorEl
    }
    target.parentNode?.insertBefore(el, target)
  }
  // 移除光标前的一个元素
  delEl() {
    const cursor = this.cursorEl
    var selection = window.getSelection()

    if (
      selection &&
      selection.toString() &&
      !selection.anchorNode?.isSameNode(selection.focusNode)
    ) {
      const deleteNodes = deleteSelectedNode(this.containerEl)
      return deleteNodes as HTMLElement[] // ？是否应该包含于fragment中返回
    } else {
      const removeTarget = cursor.previousElementSibling
      if (removeTarget) {
        cursor.parentNode?.removeChild(removeTarget)
      }
      return removeTarget
    }
  }
}

// 文本框托管句柄
export class EditorHandle {
  el: Element | null
  cursorHandle: Cursor
  changeCallBack: (
    node: string | HTMLElement | HTMLElement[] | Element | DocumentFragment | null
  ) => void // 内容变更时进行通知的回调
  onKeyBoardInput: (str: string) => void // 键盘文本输入
  initStatu: string | undefined // 是否完成初始化y:ok
  enableKeyBoard: boolean | undefined // 是否启用键盘
  autoInput?: boolean
  constructor(props: {
    el: HTMLElement
    enableKeyBoard?: boolean
    autoInput?: boolean
    onChange?: typeof None // 因html中夹杂了元素，故不进行文本回调而直接交由调用方直接操作dom自行获取
    onInput?: (str: string) => void
  }) {
    this.el = props.el
    this.cursorHandle = new Cursor(props.el)
    this.changeCallBack = props.onChange || None
    this.onKeyBoardInput = props.onInput || None
    this.autoInput = props.autoInput ?? true
    this.init()
    this.enableKeyBoardModel(props.enableKeyBoard)
  }
  // 输入句柄（初始化容器输入代理,拦截输入进行包装，在PC端表现不正常也不需要在PC端使用这种多余的方式）
  beforeInputHandle = (event: any) => {
    // 插入文本
    const inputTextWord = event.data || ''
    if (this.autoInput) {
      this.cursorHandle.insertText(inputTextWord)
      this.changeCallBack(inputTextWord)
    }
    // 回调输入
    this.onKeyBoardInput(inputTextWord)
    event.preventDefault()
    return false
  }
  // 点击事件句柄
  initTextClickFn(event: any) {
    const { target } = event
    if (target) {
      if (this.el?.isSameNode(target)) {
        // 点击模拟input的div时追加光标到文末
        this.cursorHandle.mounted(true)
      } else {
        // 否则移动光标至点击元素前
        const cursor = this.cursorHandle.cursorEl
        const previousSibling = (target as Element).previousSibling
        if (previousSibling) {
          insertAfter(cursor, previousSibling)
        } else {
          insertAfter(cursor, target)
        }
      }
    }
  }
  // 键位监听句柄(当前仅处理了删除)
  keyupFn(e: any) {
    switch (e.key) {
      case 'Backspace':
        this.changeCallBack(this.cursorHandle.delEl())
        break
      default:
        break
    }
  }
  // 监听复制事件(使用默认功能)
  copyHandle(e: any) {
    // 阻止默认行为
    // e.preventDefault();
    // 获取所选文本
    // const selectedText = window.getSelection().toString();
    // 复制文本到剪贴板
    // e.clipboardData.setData('text/plain', selectedText);
  }
  // 监听粘贴事件
  pastedHandle(e: any) {
    // 阻止默认行为
    e.preventDefault()
    // 从剪贴板获取文本
    const pastedText = e.clipboardData.getData('text/plain')
    // todo 插入前检测是否有选中文本，有则先删除再插入以模拟替换效果（此时要注意移动自定义光标，否则文本将插入到非预想的位置）
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      const nodes = this.cursorHandle.delEl()
      this.changeCallBack(nodes)
    }
    // 在输入框中插入文本
    this.insertText(pastedText)
  }
  // 剪切事件句柄
  cutHandle(e: any) {
    // 阻止默认行为
    e.preventDefault()
    // 获取所选文本
    const selectedText = window.getSelection()?.toString() || ''
    // 清空所选文本
    // document.execCommand('delete');
    const res = this.cursorHandle.delEl()
    // 将文本载入剪切板
    copyTextToClipboard(selectedText) // 非https将使容器离焦
    this.cursorHandle.focus()
    this.changeCallBack(res)
  }
  // selection句柄
  selectionchangeHandle(e: any) {
    var selection = window.getSelection()
    // 当前有文本被选中
    if (this.cursorHandle.isMount && selection && selection.type === 'Range') {
      // 获取选区中的视觉结束节点（若拖动左边的游标则需要反转，即起点下标大于结束下标）
      const startOrEndNode = [selection.anchorNode, selection.focusNode] // 【起始点，结束点】
      if (selection.focusOffset < selection.anchorOffset) {
        startOrEndNode.reverse()
      }
      let lastChild = startOrEndNode[1]
      if (lastChild && !lastChild.isSameNode(this.el)) {
        while (lastChild.parentNode && !lastChild.parentNode?.isSameNode(this.el)) {
          lastChild = lastChild?.parentNode
        }
        insertAfter(this.cursorHandle.cursorEl, lastChild)
      }
    } else {
      // 没有文本被选中
    }
  }
  // 注册事件
  init() {
    if (this.el) {
      this.el.addEventListener('beforeinput', this.beforeInputHandle.bind(this))
      this.el.addEventListener('keyup', this.keyupFn.bind(this))
      this.el.addEventListener('click', this.initTextClickFn.bind(this))
      this.el.addEventListener('copy', this.copyHandle.bind(this))
      this.el.addEventListener('paste', this.pastedHandle.bind(this))
      this.el.addEventListener('cut', this.cutHandle.bind(this))
      document.addEventListener('selectionchange', this.selectionchangeHandle.bind(this))
      this.initStatu = 'ok'
    }
  }
  enableKeyBoardModel(flag = true) {
    if (this.enableKeyBoard !== flag) {
      this.enableKeyBoard = flag
      this.el?.setAttribute('contentEditable', `${flag}`)
    }
  }
  showCursor() {
    this.cursorHandle.mounted()
  }
  focus() {
    this.cursorHandle.focus()
  }
  insertText(str: string) {
    this.cursorHandle.insertText(str)
    this.changeCallBack(str)
  }
  insertEl(html: HTMLElement | DocumentFragment) {
    this.cursorHandle.insertEl(html)
    this.changeCallBack(html)
  }
  getTextContetn() {
    return this.el?.textContent || ''
  }
  // 卸载组件前要做的事
  destroy() {
    this.el?.removeEventListener('beforeinput', this.beforeInputHandle)
    this.el?.removeEventListener('click', this.initTextClickFn)
    this.el?.removeEventListener('keyup', this.keyupFn)
    this.el?.removeEventListener('copy', this.copyHandle)
    this.el?.removeEventListener('paste', this.pastedHandle)
    this.el?.removeEventListener('cut', this.cutHandle)
    document.removeEventListener('selectionchange', this.selectionchangeHandle)
  }
}

// 光标移动
export function insertAfter(newEl: HTMLElement, targetEl: Node) {
  const parentEl = targetEl.parentNode
  if (!parentEl) {
    return
  }
  if (parentEl.lastChild == targetEl) {
    parentEl.appendChild(newEl)
  } else {
    parentEl.insertBefore(newEl, targetEl.nextSibling)
  }
}
// 文本转dom
export function translateElement(str: string) {
  const fragment = document.createDocumentFragment()
  str.split('').map((char) => {
    const charSpan = document.createElement('span')
    charSpan.textContent = char
    charSpan.className = 'txt'
    fragment.appendChild(charSpan)
  })
  return fragment
}
// 获取节点中的所有选中节点（是否存在非contentEditable为false时的删除操作）
export function getSelectedElements(containerEl: HTMLElement) {
  var selectedElements: Node[] = []
  var selection = window.getSelection()
  if (selection) {
    var rangeCount = selection.rangeCount
    var editableElement = containerEl || document.querySelector('[contentEditable="true"]')
    if (!editableElement) {
      return selectedElements // 如果没有可编辑元素，则返回空数组
    }
    // 遍历每个选取范围中的所有节点，查找选中的元素
    for (var i = 0; i < rangeCount; i++) {
      var range = selection.getRangeAt(i)
      var container: Node | null = range.commonAncestorContainer
      // 如果容器是文本节点，请使用其父元素作为容器（文本节点可能不是可编辑元素的子节点）
      if (container.nodeType === 3) {
        container = container.parentNode
      }
      // 如果容器是可编辑元素，则使用 TreeWalker 遍历其子节点
      if (container === editableElement) {
        var treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
          acceptNode: function(node: HTMLElement) {
            const newSelObj = window.getSelection()
            if (newSelObj && newSelObj.containsNode(node, true)) {
              if (node.classList.contains('cursor') || node.classList.contains('line')) {
                return NodeFilter.FILTER_SKIP
              }
              return NodeFilter.FILTER_ACCEPT
            }
            return NodeFilter.FILTER_SKIP
          },
        })
        // 遍历可编辑元素中所有选中的子节点
        while (treeWalker.nextNode()) {
          selectedElements.push(treeWalker.currentNode)
        }
      }
    }
  }
  return selectedElements
}
// 删除selection中选中的节点
export function deleteSelectedNode(containerEl: HTMLElement) {
  const selectedElements = getSelectedElements(containerEl)
  selectedElements.map((el: HTMLElement) => {
    try {
      containerEl.removeChild(el)
      console.log(el.classList, '该节点')
    } catch (error) {
      console.warn(error, el, '该节点移除失败')
    }
  })
  return selectedElements
}
// 将文本载入剪切板
export function copyTextToClipboard(text) {
  return new Promise<void>((resolve, reject) => {
    // 如果是安全域，则使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(resolve)
        .catch(reject)
    } else {
      // 否则使用 execCommand 方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed' // 防止脱离视口
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        document.body.removeChild(textArea)
      }
    }
  })
}

// 插入光标样式
function initCursorStyles() {
  const id = 'editor-box-cursor-css'
  if (document.querySelectorAll(`#${id}`).length > 0) {
    return
  }
  const styleEl = document.createElement('style')
  styleEl.id = id
  //   由于此时未挂载styleEl,styleEl.sheet为null从而无法使用insertRule,故使用内容替换
  styleEl.textContent = `
  @keyframes cursor-blinks {
    0% {
      opacity: 1;
      display: block;
    }
    50% {
      opacity: 0;
      display: none;
    }
    100% {
      opacity: 1;
      display: block;
    }
  }
  .cursor {
    width: 0;
    overflow: visible;
    position: relative;
    pointer-events: none;
    -webkit-user-select: none; /* Chrome, Safari, Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */ 
    user-select: none;
  }
  .cursor .line {
    display: inline-block;
    position: absolute;
    pointer-events: none;
    width: 0.1em;
    height: 100%;
    min-height: 1em;
    background: #000;
    left: 0;
    top: 50%;
    transform: translate(0, -50%);
    animation: cursor-blinks 1.5s infinite steps(1, start);
    -webkit-user-select: none; /* Chrome, Safari, Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */ 
    user-select: none;
  }
  `
  document.head.appendChild(styleEl)
}
