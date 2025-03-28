import { afterEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

// Create a custom router-link stub
const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to" @click.prevent><slot /></a>'
}

// Set up global stubs
config.global.stubs = {
  'router-link': RouterLinkStub,
  'router-view': true
}

// Automatically clean up after each test
afterEach(() => {
  vi.resetAllMocks()
})

// Global mocks can be added here