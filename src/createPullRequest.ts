import {InputType, RepoType} from '../types'
import {error, info} from '@actions/core'

import {Octokit} from '@octokit/core'
import {createAppAuth} from '@octokit/auth-app'

const createPullRequest = async (
  installationId: number,
  inputs: InputType,
  repo: RepoType,
) => {
  const {appId, appPrivateKey: privateKey, title, description, base} = inputs
  const {owner, name} = repo
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId,
    },
  })
  try {
    await appOctokit.request('POST /repos/{owner}/{repo}/pulls', {
      owner: owner,
      repo: name,
      head: 'relay-schema-bot',
      base: base,
      title: title,
      maintainer_can_modify: true,
      body: description,
    })

    info('Pull request was successful.')
  } catch (e) {
    const isExistPR = e.status === 422

    if (!isExistPR) {
      error(e)
      throw e
    }
  }
}

export default createPullRequest
