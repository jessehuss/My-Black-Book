import { mount as vueMount } from '@vue/test-utils'

export function mount(component, options = {}) {
  return vueMount(component, {
    global: {
      stubs: {
        'router-link': true,
        'router-view': true,
        ...options.global?.stubs
      },
      ...options.global
    },
    ...options
  })
}