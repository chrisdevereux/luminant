import * as React from 'react'
import * as Luminant from '../../../src'

export interface HomeProps {
}

export interface HomeState {
}

@Luminant.route('/')
export default class Home extends React.Component<HomeProps, HomeState> {
  state: HomeState = {}

  render() {
    return (
      <div>Hello, world!</div>
    )
  }
}
