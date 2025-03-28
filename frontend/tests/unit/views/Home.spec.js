import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../../../src/views/Home.vue'

describe('Home.vue', () => {
  it('renders welcome message', () => {
    const wrapper = mount(Home)
    
    expect(wrapper.text()).toContain('Welcome to BetTrack')
    expect(wrapper.text()).toContain('Track your bets with friends easily')
  })
}) 