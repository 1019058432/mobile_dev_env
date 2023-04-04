import {
  memo,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { MailFill, SmileFill, SmileOutline } from 'antd-mobile-icons'

import EmojiViewer from './emojiView'
import { EditorHandle } from './editor'

import styles from './index.module.scss'

export type EditorRefType = {
  hiddenEmojiList: () => void
  blur: () => void
}
type EditorProps = {
  className?: string
  emojiList?: any[]
  closeHandle?: () => void
  onChange?: (args) => void
  onInput?: (str: string) => void
  sendHandle?: () => void
}

type EmojiInputBoxParams = {
  type: 1 | 2
} & EditorProps
function EmojiInputBox(props: EmojiInputBoxParams, ref) {
  const { type, ...editorProps } = props
  return type === 1 ? (
    <HorizontalTextEditor ref={ref} {...editorProps} />
  ) : (
    <VerticalTextEditor ref={ref} {...editorProps} />
  )
}
export default forwardRef<EditorRefType, EmojiInputBoxParams>(EmojiInputBox)

// 公共代码
const useCommonHandle = (props: EditorProps, ref, changePatch) => {
  const { onChange, sendHandle, onInput } = props

  const [showEmoji, setShowEmoji] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorHandle>()

  // 输入更新时
  const changeCallHandle = useCallback(
    (...args) => {
      const str = getInputText()
      changePatch && changePatch(str)
      onChange && onChange(str)
    },
    [onChange]
  )
  // 文本输入回调（非自动输入时实现可过滤文本）
  const textareaChangeHandle = useCallback(
    (val: string) => {
      onInput && onInput(val)
    },
    [onInput]
  )

  useImperativeHandle(ref, () => ({
    hiddenEmojiList: () => {
      setShowEmoji(false)
    },
    blur: () => {
      setShowEmoji(false)
      editorRef.current?.cursorHandle.unmounted()
    },
  }))

  // 实例化托管对象
  useEffect(() => {
    if (divRef.current) {
      editorRef.current = new EditorHandle({
        el: divRef.current,
        enableKeyBoard: true,
        autoInput: true,
        onChange: changeCallHandle,
        onInput: (str: string) => {
          textareaChangeHandle(str)
        },
      })
    }
    return () => {
      editorRef.current?.destroy()
    }
  }, [changeCallHandle, textareaChangeHandle])

  // 点击显示表情时
  const showEmojiHandle = () => {
    setShowEmoji(true)
    editorRef.current?.enableKeyBoardModel(false)
    editorRef.current?.showCursor()
  }
  const hidenEmojiHandle = () => {
    editorRef.current?.enableKeyBoardModel()
    editorRef.current?.focus()
    setShowEmoji(false)
  }

  // 点击表情时，将文本追加到光标前
  const insetTextHandle = (icon) => {
    const { iconName } = icon
    editorRef.current?.insertText(iconName)
    // editorRef.current?.insertEl(dom);
  }

  const getInputText = () => {
    const str: string = editorRef.current?.getTextContetn() || ''
    return str
  }

  // 发送点击事件
  const sendClickHandle = () => {
    sendHandle && sendHandle()
  }

  return {
    divRef,
    showEmoji,
    sendClickHandle,
    showEmojiHandle,
    hidenEmojiHandle,
    insetTextHandle,
    getInputText,
  }
}

export const HorizontalTextEditor = memo(
  forwardRef<EditorRefType, EditorProps>((props: EditorProps, ref) => {
    const { className, emojiList = [] } = props

    const [showSendBtn, setShowSendBtn] = useState(false)

    const changePathch = (str) => {
      if (str && !showSendBtn) {
        setShowSendBtn(true)
      } else if (!str && showSendBtn) {
        setShowSendBtn(false)
      }
    }

    const {
      divRef,
      showEmoji,
      sendClickHandle,
      showEmojiHandle,
      hidenEmojiHandle,
      insetTextHandle,
    } = useCommonHandle(props, ref, changePathch)

    const editorElClassNames = useMemo(() => {
      return [styles['input-text-box-1'], className].join(' ')
    }, [className])

    return (
      <div className={styles['bottom-input-box']}>
        <div className={styles['honor-view']}>
          <div ref={divRef} className={editorElClassNames}></div>
          <div className={styles['emoji-btn']}>
            {showEmoji ? (
              <SmileFill className={styles['emoji-icon']} onClick={hidenEmojiHandle} />
            ) : (
              <SmileOutline className={styles['emoji-icon']} onClick={showEmojiHandle} />
            )}
          </div>
          {showSendBtn && (
            <div className={styles['send-icon']} onClick={sendClickHandle}>
              发送
            </div>
          )}
        </div>

        {/* 工具栏 */}
        <div>
          {showEmoji && <EmojiViewer emojiList={emojiList} onEmojiClick={insetTextHandle} />}
        </div>
      </div>
    )
  })
)
export const VerticalTextEditor = memo(
  forwardRef<EditorRefType, EditorProps>((props: EditorProps, ref) => {
    const { className, emojiList = [] } = props
    const editorElClassNames = useMemo(() => {
      return [styles['input-text-box-2'], className].join(' ')
    }, [className])

    const [showToolBar, setShowToolBar] = useState(false)

    const changePathch = (str) => {}

    const {
      divRef,
      showEmoji,
      sendClickHandle,
      showEmojiHandle,
      hidenEmojiHandle,
      insetTextHandle,
    } = useCommonHandle(props, ref, changePathch)

    const showToolBarHandle = () => {
      setShowToolBar(true)
    }

    return (
      <div>
        <div>
          <div ref={divRef} onFocus={showToolBarHandle} className={editorElClassNames}></div>
        </div>

        {/* 工具栏 */}
        <div className={styles['tool-box']}>
          {showToolBar && (
            <div className={styles['tool-header']}>
              <div className={styles['emoji-btn']}>
                {showEmoji ? (
                  <span onClick={hidenEmojiHandle}>打开键盘</span>
                ) : (
                  <span onClick={showEmojiHandle}>打开表情</span>
                )}
              </div>
              <div>
                <span>工具2</span>
              </div>
            </div>
          )}
          {showEmoji && <EmojiViewer emojiList={emojiList} onEmojiClick={insetTextHandle} />}
        </div>
      </div>
    )
  })
)
