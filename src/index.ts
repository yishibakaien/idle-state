import OptionsInterface from './interfaces/Options'
import Detector from './detector'

export default function(task: any , options?: OptionsInterface) {
  return new Detector(task, options)
}
