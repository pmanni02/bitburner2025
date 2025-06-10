import React from '/lib/react'

export function Button({ id, name, onClickFn }: {
  id: string,
  name: string,
  onClickFn: () => void
}) {
  return (
    <button id={id} onClick={onClickFn}>
      {name}
    </button>
  )
}