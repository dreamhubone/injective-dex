import { actionTree, mutationTree } from 'typed-vuex'
import { AccountAddress } from '@injectivelabs/ts-types'
import { refer, getFeeRecipient } from '~/app/services/referral'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  feeRecipient: undefined as AccountAddress | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  feeRecipient: initialState.feeRecipient as AccountAddress | undefined
})

export type ReferralStoreState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  setFeeRecipient(state: ReferralStoreState, feeRecipient: AccountAddress) {
    state.feeRecipient = feeRecipient
  },

  reset(state: ReferralStoreState) {
    const initialState = initialStateFactory()

    state.feeRecipient = initialState.feeRecipient
  }
})

export const actions = actionTree(
  { state, mutations },
  {
    async init(_) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      await this.app.$accessor.referral.getFeeRecipient(injectiveAddress)
    },

    async getFeeRecipient({ commit }, address: AccountAddress) {
      commit('setFeeRecipient', await getFeeRecipient(address))
    },

    async refer(_, code: string) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      await refer({ address: injectiveAddress, code })

      backupPromiseCall(() =>
        this.app.$accessor.referral.getFeeRecipient(injectiveAddress)
      )
    }
  }
)