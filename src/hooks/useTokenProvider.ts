import { useCallback, useEffect, useState } from 'react'
import { TokenInfo } from '@solana/spl-token-registry'
import { tokenProvider } from '@sentre/senhub'

import { usePool } from 'hooks/usePool'

const useTokenProvider = (mintAddress: string) => {
  const { pools } = usePool()
  const [tokenInfo, setTokenInfo] = useState<(TokenInfo | undefined)[]>([])

  const fetchTokenInfo = useCallback(async () => {
    if (!mintAddress) return setTokenInfo([undefined])
    // Normal mint
    const token = await tokenProvider.findByAddress(mintAddress)
    if (token) return setTokenInfo([token])
    // LP mint
    const poolData = Object.values(pools).find(
      ({ mint_lpt }) => mint_lpt === mintAddress,
    )
    if (!poolData) return setTokenInfo([undefined])
    const { mint_a, mint_b } = poolData
    const tokenA = await tokenProvider.findByAddress(mint_a)
    const tokenB = await tokenProvider.findByAddress(mint_b)
    return setTokenInfo([tokenA, tokenB])
  }, [mintAddress, pools])

  useEffect(() => {
    fetchTokenInfo()
  }, [fetchTokenInfo])

  return tokenInfo
}

export default useTokenProvider
