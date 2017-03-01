import { createBrowserHistory, History } from 'history'
import { memoize } from 'lodash'

export const history: () => History = memoize(() => createBrowserHistory())
