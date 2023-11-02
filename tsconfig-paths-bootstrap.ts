import { parse } from 'jsonc-parser'
import path from 'path'
import fs from 'fs'
import * as tsConfigPaths from 'tsconfig-paths'

const filepath = path.resolve(__dirname, 'tsconfig.build.json')
const tsConfigStr = fs.readFileSync(filepath, 'utf-8')
const tsConfig = parse(tsConfigStr)

tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.outDir,
  paths: tsConfig.compilerOptions.paths,
})
