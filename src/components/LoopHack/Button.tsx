import React from '/lib/react'

export function Button({ id, style, name, onClickFn }: {
  id: string,
  style?: Record<string, string>,
  name: string,
  onClickFn: () => void
}) {
  return (
    <button id={id} style={style} onClick={onClickFn}>
      {name}
    </button>
  )
}