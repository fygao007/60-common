import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

const defaultTools = [
  { key: 'undo', icon: 'arrow-go-back-line', label: '撤销', command: 'undo' },
  { key: 'redo', icon: 'arrow-go-forward-line', label: '重做', command: 'redo' },
  { key: 'heading1', icon: 'heading-1', label: '一级标题', command: 'formatBlock', value: 'h1' },
  { key: 'heading2', icon: 'heading-2', label: '二级标题', command: 'formatBlock', value: 'h2' },
  { key: 'bold', icon: 'bold', label: '加粗', command: 'bold' },
  { key: 'italic', icon: 'italic', label: '斜体', command: 'italic' },
  { key: 'underline', icon: 'underline', label: '下划线', command: 'underline' },
  { key: 'strike', icon: 'strikethrough', label: '删除线', command: 'strikeThrough' },
  { key: 'ordered', icon: 'list-ordered', label: '有序列表', command: 'insertOrderedList' },
  { key: 'unordered', icon: 'list-unordered', label: '无序列表', command: 'insertUnorderedList' },
  { key: 'quote', icon: 'double-quotes-r', label: '引用', command: 'formatBlock', value: 'blockquote' },
  { key: 'code', icon: 'code-s-slash-line', label: '代码', command: 'formatBlock', value: 'pre' },
  { key: 'link', icon: 'link-s', label: '链接', command: 'createLink' },
  { key: 'image', icon: 'image-2-line', label: '图片', command: 'insertImage' },
]

function getPlainText(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export default function DSRichTextEditor({
  value,
  defaultValue = '',
  placeholder = '请输入正文内容',
  maxLength = 5000,
  disabled = false,
  error = false,
  tools = defaultTools,
  className = '',
  onChange,
  ...props
}) {
  const editorRef = useRef(null)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = value !== undefined ? value : internalValue
  const textLength = useMemo(() => getPlainText(currentValue).length, [currentValue])

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== currentValue) {
      editorRef.current.innerHTML = currentValue
    }
  }, [currentValue])

  const commitValue = () => {
    const nextValue = editorRef.current?.innerHTML || ''
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  const runCommand = (tool) => {
    if (disabled) return
    editorRef.current?.focus()
    if (tool.command === 'createLink') {
      document.execCommand(tool.command, false, '#')
    } else if (tool.command === 'insertImage') {
      document.execCommand(tool.command, false, '')
    } else {
      document.execCommand(tool.command, false, tool.value)
    }
    commitValue()
  }

  const classes = [
    'ds-richtext',
    disabled && 'is-disabled',
    error && 'is-error',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      <div className="ds-richtext__toolbar" role="toolbar" aria-label="富文本工具栏">
        {tools.map((tool) => (
          <button
            className="ds-richtext__tool"
            type="button"
            title={tool.label}
            aria-label={tool.label}
            disabled={disabled}
            data-icon={tool.icon}
            key={tool.key}
            onClick={() => runCommand(tool)}
          />
        ))}
      </div>
      <div
        className="ds-richtext__editor"
        ref={editorRef}
        contentEditable={!disabled}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={commitValue}
      />
      <div className="ds-richtext__footer">
        <span className="ds-richtext__hint">{disabled ? '已禁用，不可编辑' : '支持基础文字、列表、引用、链接和图片内容'}</span>
        <span className="ds-richtext__counter">{textLength}/{maxLength}</span>
      </div>
    </div>
  )
}

export { defaultTools as richTextTools }
