import {endGroup, startGroup} from '@actions/core'

import {InputType} from '../types'
import {Octokit} from '@octokit/core'
import {createAppAuth} from '@octokit/auth-app'
import createPullRequest from './createPullRequest'
import generateRelaySchemaFiles from './generateRelaySchemaFiles'
import {getInput} from '@actions/core'

const main = async (inputs: InputType): Promise<void> => {
  validate(inputs)
  startGroup('Run relay schema bot')

  const repo = setRepoNameAndOwner(inputs.repoUrl)
  const {status, installationId} = await getAppInstallId(
    inputs.appId,
    inputs.appPrivateKey,
    repo,
  )

  if (status === 200 && installationId) {
    startGroup('Generate relay schema')
    generateRelaySchemaFiles(inputs.token, repo)
    endGroup()

    startGroup('Request PR')
    createPullRequest(installationId, inputs, repo)
    endGroup()
  }

  endGroup()
}

const getAppInstallId = async (
  appId: string,
  privateKey: string,
  repo: {
    name: string
    owner: string
  },
): Promise<{
  status: number
  installationId: number
}> => {
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  })

  const res = await appOctokit.request(
    'GET /repos/{owner}/{repo}/installation',
    {
      owner: repo.owner,
      repo: repo.name,
    },
  )

  return {
    status: res.status,
    installationId: res.data.id,
  }
}

const setRepoNameAndOwner = (repoUrl: string) => {
  const repoPattern = /https:\/\/github.com\/.+[^.git]/
  const matchRepoUrl = repoUrl.match(repoPattern)[0]

  const repoArray = matchRepoUrl.split('/')
  const owner = repoArray[3]
  const name = repoArray[4]

  return {
    name,
    owner,
  }
}

const validate = (inputs: InputType) => {
  const requiredFields = ['token', 'repoUrl', 'appId', 'appPrivateKey']

  requiredFields.forEach((filed) => {
    if (!inputs[filed]) {
      throw new Error(`${filed} is required.`)
    }
  })

  const repoPattern = /https:\/\/github.com\/.+/
  const isGithubRepoUrl = repoPattern.test(inputs.repoUrl)

  if (!isGithubRepoUrl) {
    throw new Error('Is not a Github repository url. Does it end with .git?')
  }
}

const inputs: InputType = {
  token: getInput('token'),
  title: getInput('title'),
  repoUrl: getInput('repo-url'),
  base: getInput('base'),
  description: getInput('description'),

  appId: getInput('app-id'),
  appPrivateKey: getInput('app-private-key'),
}

main(inputs)
