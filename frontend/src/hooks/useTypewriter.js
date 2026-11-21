import { useState, useEffect } from 'react'

/**
 * 打字机效果 Hook
 * @param {string} text - 要显示的完整文本
 * @param {number} speed - 打字速度（毫秒/字符）
 * @param {boolean} enabled - 是否启用打字机效果
 */
export const useTypewriter = (text, speed = 30, enabled = true) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    setDisplayedText('')

    let currentIndex = 0
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(intervalId)
      }
    }, speed)

    return () => clearInterval(intervalId)
  }, [text, speed, enabled])

  return { displayedText, isTyping }
}
