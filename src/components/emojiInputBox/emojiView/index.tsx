import { useState } from 'react'

import './index.scss'

export default function EmojiViewer(props) {
  const { className, onEmojiClick, emojiList } = props

  const [selectType, setSelectType] = useState('normal')

  const emojiClickHandle = (icon) => {
    onEmojiClick && onEmojiClick(icon)
  }
  const changeSelectType = (item) => {
    const { identity } = item
    if (selectType !== identity) {
      setSelectType(identity)
    }
  }
  return (
    <div className={`emoji-content-box ${className}`}>
      <div className="menu-list">
        {emojiList.map((item, index) => {
          const { type, identity, url } = item
          return (
            <div
              className={selectType == identity ? 'menu-item menu-item-hover' : 'menu-item'}
              onClick={() => {
                changeSelectType(item)
              }}
              key={index}
            >
              {type === 'img' ? <img className="menu-item-img" src={url} alt={identity} /> : url}
            </div>
          )
        })}
      </div>
      <div className="emoji-list-box">
        {emojiList.map((typeItem, index) => {
          const { icons, identity, type } = typeItem
          return (
            <div
              className={
                identity == selectType
                  ? 'emoji-classify-item classify-selected'
                  : 'emoji-classify-item'
              }
              id={type}
              key={index}
            >
              {icons.map((icon, i) => {
                const { url } = icon
                return (
                  <div
                    key={i}
                    className="select-item"
                    onClick={() => {
                      emojiClickHandle(icon)
                    }}
                  >
                    {type === 'img' ? <img className="select-item-img" src={url} /> : url}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
