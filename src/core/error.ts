const routeErrorHandlerMarker = 'reboot-error-handler'
const globalErrorHandlerMarker = 'reboot-error-handler-component'

export function markErrorHandler(route: any) {
  route[routeErrorHandlerMarker] = true
}

export function isErrorHandler(route: any): boolean {
  return route[routeErrorHandlerMarker] || false
}

export function getErrorRoute(route: any): React.ComponentClass<{ error: any }> {
  return route[routeErrorHandlerMarker] || false
}
