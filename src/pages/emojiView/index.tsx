import { useState, useRef, useCallback } from 'react'
import { View } from '@tarojs/components'
import EmojiInputBox, { EditorRefType } from '@/components/emojiInputBox'

import { useClickOutside } from '@/utils/fnLibrary'

import { emojiList } from './emojis'

function EmojiView(props: any) {
  return (
    <View>
      <View>EmojiView</View>
      <ComomInput />
    </View>
  )
}

export default EmojiView

// 评论输入
type ComomInputParams = {
  onBlur?: () => void
  onSend?: (str) => void
}
const ComomInput = (props: ComomInputParams) => {
  const { onSend, onBlur } = props
  const sendHan = () => {
    onSend && onSend(input)
  }
  const [input, setInput] = useState('')
  const commonInputRef = useRef<HTMLElement>(null)
  const editorBoxRef = useRef<EditorRefType>(null)
  const closeHandle = useCallback(() => {}, [])

  const onChangeHandle = useCallback((str: string) => {
    setInput(str)
  }, [])
  // 监听点击编辑区域外部则回归input及隐藏表情工具
  useClickOutside(commonInputRef, () => {
    editorBoxRef.current?.blur()
    onBlur && onBlur()
  })
  return (
    <View ref={commonInputRef}>
      {/* 当前实现forward时导致memo缓存失效，待修复，否则会产生多个光标 */}
      <EmojiInputBox
        ref={editorBoxRef}
        emojiList={emojiList}
        type={1}
        closeHandle={closeHandle}
        onChange={onChangeHandle}
        sendHandle={sendHan}
      />
    </View>
  )
}
