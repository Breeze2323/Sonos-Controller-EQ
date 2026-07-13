import { createControllerServer } from './server/controller.js'

const port = Number.parseInt(process.env.PORT || '3000', 10)
createControllerServer().listen(port, '127.0.0.1', () => console.log(`Sonos Controller running at http://127.0.0.1:${port}`))
