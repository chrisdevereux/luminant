import * as React from 'react'
import { history } from '../runtime/history';

export default class Link extends React.Component<React.HTMLProps<HTMLAnchorElement>, {}> {
  handleClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    if (this.props.onClick) {
      this.props.onClick(evt)
    }

    if (!this.props.href) return
    if (evt.metaKey || evt.shiftKey || evt.ctrlKey) return
    if (evt.defaultPrevented) return

    history().push(this.props.href)
    evt.preventDefault()
  }

  render() {
    return (
      <a {...this.props} onClick={this.handleClick} />
    )
  }
}
