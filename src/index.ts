import OptionsInterface from './interfaces/Options'
import IdleState from './idleState'

export default function(task: any , options?: OptionsInterface) {
  return new IdleState(task, options)
}
