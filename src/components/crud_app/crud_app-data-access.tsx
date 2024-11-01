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

interface CreateEntryArgs {
  title: string;
  message:  string;
  owner:  PublicKey;
}


export function useCrudAppProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudAppProgramId(cluster.network as Cluster), [cluster])
  const program = getCrudAppProgram(provider)

  const accounts = useQuery({
    queryKey: ['crud_app', 'all', { cluster }],
    queryFn: () => program.account.entryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })


  const createEntry =  useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`entryState`, `create`, { cluster }],
    mutationFn: async ({title, message, owner}) => {
      return program.methods.createTodolist(title, message).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature),
      accounts.refetch();
    },

    onError: (error) => {
      toast.error(`Error creating entry: ${error.message}`);
    }
  }) 


  return {
    program,
    accounts,
    getProgramAccount,
    createEntry
  }

  
}

export function useCrudAppProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrudAppProgram()

  const accountQuery = useQuery({
    queryKey: ['crud_app', 'fetch', { cluster, account }],
    queryFn: () => program.account.entryState.fetch(account),
  })

  const updateEntry =  useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`entryState`, `update`, { cluster }],
    mutationFn: async ({title, message}) => {
      return program.methods.updateTodolist(title, message).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature),
      accounts.refetch();
    },

    onError: (error) => {
      toast.error(`Error creating entry: ${error.message}`);
    }
  }) 


  const deleteEntry =  useMutation({
    mutationKey: [`entryState`, `delete`, { cluster }],
    mutationFn: (title:  string) => {
      return program.methods.deleteTodolist(title).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature),
      accounts.refetch();
    },

    onError: (error) => {
      toast.error(`Error creating entry: ${error.message}`);
    }
  }) 


  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
}
