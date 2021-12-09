import {RepoType} from '../types'
import {execSync} from 'child_process'
import {info} from '@actions/core'

const generateRelaySchemaFiles = (token: string, {owner, name}: RepoType) => {
  const {NODE_ENV} = process.env
  const appRoot = process.cwd()
  const workspacePath = `${appRoot}/workspace`

  info('Prepare to generate')
  if (NODE_ENV === 'development') {
    execSync(`rm -rf ${workspacePath}`)
  }
  execSync('git config --global user.email "support@dooboolab.com"')
  execSync('git config --global user.name "relay-schema-bot"')

  info("Run 'git clone' command...")
  execSync(
    `git clone https://${token}@github.com/${owner}/${name}.git ${workspacePath}`,
  )

  info('Install dependencies')
  execSync(
    `cp ${workspacePath}/package.json ${workspacePath}/temp-package.json`,
  )
  execSync(
    `cp ${workspacePath}/package.json ${workspacePath}/temp-package.json`,
  )
  execSync(`cp ${appRoot}/workspace-package.json ${workspacePath}/package.json`)

  execSync(`npm install --prefix ${workspacePath} --package-lock false`, {
    stdio: 'inherit',
  })

  info('Generate Relay schema files')
  execSync(`npm run --prefix ${workspacePath} generate`, {stdio: 'inherit'})

  info('Generate Relay schema')
  execSync(
    `mv ${workspacePath}/temp-package.json ${workspacePath}/package.json`,
  )

  info('Create a remote branch for relay-schema-bot')
  execSync(
    `cd ${workspacePath} && git checkout -b relay-schema-bot && git add . && git commit -m "Generate Relay schema files" && git push -uf origin relay-schema-bot`,
    {stdio: 'inherit'},
  )

  if (NODE_ENV === 'development') {
    info('Clean up workspace')
    execSync(`rm -rf ${workspacePath}`)
  }
}

export default generateRelaySchemaFiles
