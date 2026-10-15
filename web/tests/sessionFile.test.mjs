import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { readHermesSession } from '../server/acp/sessionFile.ts'

test('reads profile sessions with string or array runtime args', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hermesum-session-reader-'))
  const oldHome = process.env.HOME
  const oldHermes = process.env.HERMES_HOME
  try {
    process.env.HOME = root
    delete process.env.HERMES_HOME
    const dir = join(root, '.hermes', 'profiles', 'fixture', 'sessions')
    await mkdir(dir, { recursive: true })
    const expected = { session_id: 'example', messages: [{ role: 'user', content: 'hello' }] }
    await writeFile(join(dir, 'session_example.json'), JSON.stringify(expected))
    for (const args of [['--profile', 'fixture', 'acp'], '--profile fixture acp']) {
      assert.deepEqual(await readHermesSession({ hermesAcpArgs: args }, 'example'), expected)
    }
    assert.equal(await readHermesSession({}, 'missing'), null)
  } finally {
    if (oldHome === undefined) delete process.env.HOME
    else process.env.HOME = oldHome
    if (oldHermes === undefined) delete process.env.HERMES_HOME
    else process.env.HERMES_HOME = oldHermes
    await rm(root, { recursive: true, force: true })
  }
})
