import * as React from 'react'
import { render as initialRender } from 'react-dom';

let client: ClientWrapper

export function render(content?: React.ReactElement<{}>) {
  if (client) {
    client.setState({ content })
    return
  }

  initialRender(<ClientWrapper content={content} />, document.getElementById('app'))
}

interface ClientState {
  content?: React.ReactElement<{}>
}

class ClientWrapper extends React.Component<ClientState, ClientState> {
  state: ClientState = {}

  static displayName = 'Luminant'

  constructor(props: {}) {
    super(props)

    if (client) {
      throw new Error('Cannot instantiate multiple client instances')
    }

    client = this
  }

  render() {
    return this.state.content || this.props.content || null
  }
}
