/**
 * 简化的 Markdown 渲染器 - 专门针对阅读体验优化
 * 优化了 padding、line-height 等样式参数
 */

/**
 * 渲染 Markdown 为 rich-text 节点 - 添加死循环防护
 */
function renderMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return []
  }

  // 添加输入长度限制，防止异常输入
  if (markdown.length > 50000) {
    console.warn('Markdown 内容过长，可能影响性能')
    return [{
      name: 'div',
      attrs: { style: 'padding: 24rpx; line-height: 1.8; color: #dc3545;' },
      children: [{ type: 'text', text: '内容过长，无法渲染' }]
    }]
  }

  try {
    const lines = markdown.split('\n')
    const nodes = []
    let i = 0
    let loopCount = 0
    const maxLoops = lines.length * 2 // 防死循环保护

    while (i < lines.length && loopCount < maxLoops) {
      loopCount++
      const line = lines[i].trim()
      
      // 跳过空行，但添加换行节点
      if (line === '') {
        if (nodes.length > 0) {
          nodes.push({
            name: 'div',
            attrs: { style: 'height: 24rpx; margin: 8rpx 0;' }
          })
        }
        i++
        continue
      }

      // 处理标题
      if (line.startsWith('### ')) {
        nodes.push(createHeading(3, line.substring(4).trim()))
        i++
        continue
      }

      if (line.startsWith('## ')) {
        nodes.push(createHeading(2, line.substring(3).trim()))
        i++
        continue
      }

      if (line.startsWith('# ')) {
        nodes.push(createHeading(1, line.substring(2).trim()))
        i++
        continue
      }

      // 处理引用
      if (line.startsWith('> ')) {
        nodes.push({
          name: 'div',
          attrs: { 
            style: 'border-left: 6rpx solid #007aff; padding: 20rpx 24rpx; margin: 32rpx 16rpx; background-color: #f8f9fa; color: #6c757d; font-style: italic; line-height: 1.8; border-radius: 8rpx;' 
          },
          children: parseInlineText(line.substring(2).trim())
        })
        i++
        continue
      }

      // 处理水平线
      if (line === '---' || line === '***') {
        nodes.push({
          name: 'div',
          attrs: { 
            style: 'border-top: 2rpx solid #e9ecef; margin: 48rpx 16rpx; height: 0;' 
          }
        })
        i++
        continue
      }

      // 处理代码块
      if (line.startsWith('```')) {
        const codeLines = []
        i++ // 跳过开始的 ```
        let codeLoopCount = 0
        const maxCodeLoops = 1000 // 代码块循环保护
        
        while (i < lines.length && !lines[i].trim().startsWith('```') && codeLoopCount < maxCodeLoops) {
          codeLines.push(lines[i])
          i++
          codeLoopCount++
        }
        
        if (i < lines.length) i++ // 跳过结束的 ```
        
        nodes.push({
          name: 'div',
          attrs: { 
            style: 'background-color: #f8f9fa; border: 1rpx solid #e9ecef; border-radius: 12rpx; padding: 24rpx; margin: 32rpx 16rpx; font-family: Monaco, Consolas, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre; overflow-x: auto; word-wrap: break-word;' 
          },
          children: [{ type: 'text', text: codeLines.join('\n') }]
        })
        continue
      }

      // 处理列表
      if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\. /.test(line)) {
        const listItems = []
        let listLoopCount = 0
        const maxListLoops = 1000 // 列表循环保护
        
        while (i < lines.length && listLoopCount < maxListLoops) {
          const currentLine = lines[i].trim()
          if (currentLine.startsWith('- ') || currentLine.startsWith('* ')) {
            listItems.push(parseInlineText(currentLine.substring(2).trim()))
          } else if (/^\d+\. /.test(currentLine)) {
            listItems.push(parseInlineText(currentLine.replace(/^\d+\.\s+/, '')))
          } else {
            break
          }
          i++
          listLoopCount++
        }

        nodes.push({
          name: 'div',
          attrs: { 
            style: 'margin: 24rpx 16rpx; padding-left: 32rpx; line-height: 1.8;' 
          },
          children: listItems.map(item => ({
            name: 'div',
            attrs: { style: 'margin: 16rpx 0; padding-left: 12rpx; line-height: 1.8;' },
            children: [
              { type: 'text', text: '• ' },
              ...item
            ]
          }))
        })
        continue
      }

      // 处理普通段落
      const paragraphLines = []
      let paragraphLoopCount = 0
      const maxParagraphLoops = 1000 // 段落循环保护
      
      while (i < lines.length && lines[i].trim() !== '' && !isSpecialLine(lines[i]) && paragraphLoopCount < maxParagraphLoops) {
        paragraphLines.push(lines[i].trim())
        i++
        paragraphLoopCount++
      }

      if (paragraphLines.length > 0) {
        const content = paragraphLines.join(' ')
        nodes.push({
          name: 'div',
          attrs: { 
            style: 'margin: 24rpx 16rpx; line-height: 1.8; color: #212529; font-size: 30rpx; padding: 8rpx 0;' 
          },
          children: parseInlineText(content)
        })
      }
    }

    // 如果循环计数器达到限制，记录警告
    if (loopCount >= maxLoops) {
      console.warn('Markdown 渲染循环达到最大限制，可能存在异常内容')
    }

    return nodes

  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return [{
      name: 'div',
      attrs: { style: 'padding: 24rpx; line-height: 1.8;' },
      children: [{ type: 'text', text: markdown }]
    }]
  }
}

/**
 * 创建标题节点 - 优化了间距和阅读体验
 */
function createHeading(level, text) {
  const styles = {
    1: 'font-size: 42rpx; font-weight: bold; color: #212529; margin: 48rpx 16rpx 28rpx 16rpx; line-height: 1.4; padding: 8rpx 0 24rpx 0; border-bottom: 2rpx solid #e9ecef;',
    2: 'font-size: 36rpx; font-weight: bold; color: #212529; margin: 40rpx 16rpx 24rpx 16rpx; line-height: 1.4; padding: 8rpx 0;',
    3: 'font-size: 32rpx; font-weight: bold; color: #212529; margin: 32rpx 16rpx 20rpx 16rpx; line-height: 1.4; padding: 8rpx 0;'
  }

  return {
    name: 'div',
    attrs: { style: styles[level] },
    children: parseInlineText(text)
  }
}

/**
 * 解析行内文本（粗体、斜体、代码等）- 优化样式，防止死循环
 */
function parseInlineText(text) {
  if (!text) return [{ type: 'text', text: '' }]

  const nodes = []
  let lastIndex = 0
  
  // 处理粗体 - 添加防死循环保护
  const boldRegex = /\*\*(.*?)\*\*/g
  let match
  let loopCount = 0
  const maxLoops = 1000 // 防死循环保护
  
  while ((match = boldRegex.exec(text)) !== null && loopCount < maxLoops) {
    loopCount++
    
    // 防止零长度匹配导致的无限循环
    if (match[0].length === 0) {
      boldRegex.lastIndex++
      continue
    }
    
    // 添加粗体前的文本
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      nodes.push(...parseOtherInline(beforeText))
    }
    
    // 添加粗体文本
    nodes.push({
      name: 'span',
      attrs: { style: 'font-weight: bold; color: #212529;' },
      children: [{ type: 'text', text: match[1] }]
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    nodes.push(...parseOtherInline(remainingText))
  }
  
  return nodes.length > 0 ? nodes : [{ type: 'text', text: text }]
}

/**
 * 解析其他行内元素（斜体、代码、链接）- 优化样式，防止死循环
 */
function parseOtherInline(text) {
  if (!text || text.length > 10000) { // 添加长度保护
    return [{ type: 'text', text: text || '' }]
  }

  const nodes = []
  let remaining = text
  
  try {
    // 处理行内代码 - 优化样式，添加安全检查
    const codeRegex = /`([^`]+)`/g
    remaining = remaining.replace(codeRegex, (match, code) => {
      return `__CODE__${code}__CODE__`
    })
    
    // 处理斜体 - 添加安全检查
    const italicRegex = /\*([^*]+)\*/g
    remaining = remaining.replace(italicRegex, (match, italic) => {
      return `__ITALIC__${italic}__ITALIC__`
    })
    
    // 处理链接 - 添加安全检查
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    remaining = remaining.replace(linkRegex, (match, text, url) => {
      return `__LINK__${text}|${url}__LINK__`
    })
    
    // 拆分并处理特殊标记
    const parts = remaining.split(/(__CODE__|__ITALIC__|__LINK__)/)
    let isSpecial = false
    let specialType = ''
    
    // 限制处理的部分数量，防止异常输入
    const maxParts = 500
    const processParts = parts.slice(0, maxParts)
    
    for (let i = 0; i < processParts.length; i++) {
      const part = processParts[i]
      
      if (part === '__CODE__') {
        isSpecial = true
        specialType = 'code'
        continue
      }
      
      if (part === '__ITALIC__') {
        isSpecial = true
        specialType = 'italic'
        continue
      }
      
      if (part === '__LINK__') {
        isSpecial = true
        specialType = 'link'
        continue
      }
      
      if (isSpecial) {
        switch (specialType) {
          case 'code':
            nodes.push({
              name: 'span',
              attrs: { style: 'background-color: #f8f9fa; border: 1rpx solid #e9ecef; border-radius: 6rpx; padding: 4rpx 8rpx; margin: 0 2rpx; font-family: Monaco, Consolas, monospace; font-size: 26rpx; color: #e83e8c;' },
              children: [{ type: 'text', text: part }]
            })
            break
          case 'italic':
            nodes.push({
              name: 'span',
              attrs: { style: 'font-style: italic; color: #6c757d;' },
              children: [{ type: 'text', text: part }]
            })
            break
          case 'link':
            const linkParts = part.split('|')
            if (linkParts.length >= 2) {
              const [linkText, linkUrl] = linkParts
              nodes.push({
                name: 'span',
                attrs: { style: 'color: #007aff; text-decoration: underline; padding: 2rpx 0;' },
                children: [{ type: 'text', text: linkText }]
              })
            } else {
              nodes.push({ type: 'text', text: part })
            }
            break
        }
        isSpecial = false
        specialType = ''
      } else if (part) {
        nodes.push({ type: 'text', text: part })
      }
    }
    
  } catch (error) {
    console.error('parseOtherInline 处理失败:', error)
    return [{ type: 'text', text: text }]
  }
  
  return nodes.length > 0 ? nodes : [{ type: 'text', text: text }]
}

/**
 * 判断是否为特殊行
 */
function isSpecialLine(line) {
  const trimmed = line.trim()
  return trimmed.startsWith('#') || 
         trimmed.startsWith('>') || 
         trimmed.startsWith('```') ||
         trimmed.startsWith('- ') ||
         trimmed.startsWith('* ') ||
         /^\d+\. /.test(trimmed) ||
         trimmed === '---' ||
         trimmed === '***'
}

module.exports = {
  render: renderMarkdown,
  toRichText: renderMarkdown
}
