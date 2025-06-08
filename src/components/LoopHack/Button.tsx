const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

type Props = {
  id: string,
  name: string,
  onClickFn: () => void
}

export function Button({ id, name, onClickFn }: Props) {
  return (
    <button id={id} onClick={onClickFn}>
      {name}
    </button>
  )
}