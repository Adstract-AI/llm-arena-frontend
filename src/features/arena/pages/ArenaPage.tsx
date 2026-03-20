import { PromptInput } from '../components/PromptInput'
import { ResponsePair } from '../components/ResponsePair'
import { VotePanel } from '../components/VotePanel'

export function ArenaPage() {
  return (
    <section>
      <h2>Arena</h2>
      <PromptInput />
      <ResponsePair />
      <VotePanel />
    </section>
  )
}
