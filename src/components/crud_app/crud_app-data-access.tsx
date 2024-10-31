'use client'

import {getCrudAppProgram, getCrudAppProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useCrudAppProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudAppProgramId(cluster.network as Cluster), [cluster])
  const program = getCrudAppProgram(provider)

  const accounts = useQuery({
    queryKey: ['crud_app', 'all', { cluster }],
    queryFn: () => program.account.crud_app.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['crud_app', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ crud_app: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useCrudAppProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrudAppProgram()

  const accountQuery = useQuery({
    queryKey: ['crud_app', 'fetch', { cluster, account }],
    queryFn: () => program.account.crud_app.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['crud_app', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ crud_app: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['crud_app', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ crud_app: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['crud_app', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ crud_app: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['crud_app', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ crud_app: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
