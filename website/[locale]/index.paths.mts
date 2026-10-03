import { messages } from '../.vitepress/messages'
import { localePaths } from '../.vitepress/shared/config'

export default {
	paths: () => localePaths(messages),
}
